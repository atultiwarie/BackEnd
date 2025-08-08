require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const postModel = require("./models/post");

// MongoDB connection
const connectDB = require("./config/db");
connectDB();

// user model
const User = require("./models/user-model");

// Middleware for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// json parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

// Home route
app.get("/", (req, res) => {
  res.render("home");
});

// Register route

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, email, password, name, age } = req.body;
  try {
    if (!username || !email || !password)
      return res.status(400).send("All fields are required");
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
      name,
      age,
    });
    res.redirect("/login");
  } catch (err) {
    console.error("Error during registration:", err.message);
    return res.status(500).send("Internal Server Error");
  }
});

// Login route

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password)
      return res.status(400).send("All fields are required");

    const user = await User.findOne({
      $or: [
        {
          username,
        },
        {
          email: username,
        },
      ],
    });
    if (!user) return res.status(400).send("Invalid username ");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid  password");

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token);
    res.redirect("/profile");
  } catch (err) {
    console.error("Error during login:", err.message);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// auth middleware
function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid or expired token");
  }
}

// Profile route
app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await User.findById(req.user.id).populate("posts");
  res.render("profile", { user });
});

// Post route

app.post("/posts", isLoggedIn, async (req, res) => {
  const { content } = req.body;
  let user = await User.findById(req.user.id);
  let post = await postModel.create({
    user: user._id,
    content,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

// delete post route
app.get("/posts/delete/:id", isLoggedIn, async (req, res) => {
 const postId = req.params.id;
 try {
    await postModel.findByIdAndDelete(postId)
    res.redirect("/profile");
 } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).send("Internal Server Error");    
 }
});


// like post route

app.get('/posts/like/:id', isLoggedIn,async (req,res)=>{
  const id = req.params.id;
  let post = await postModel.findById(id)
   if (post.likes.indexOf(req.user.id) === -1) {
     post.likes.push(req.user.id);
   } else {
     post.likes.splice(post.likes.indexOf(req.user.id), 1);
   }
   await post.save();
   res.redirect("/profile");
})

// edit post route

app.get('/edit/:id',isLoggedIn , async(req,res)=>{
  const {id}=req.params
  let post = await postModel.findById(id)
  res.render('edit',{post})
})

app.post('/edit/:id',isLoggedIn,async (req,res) => {
  const id = req.params.id
  const content = req.body.content
  let post = await postModel.findByIdAndUpdate(id,
            {content},
            {new:true})
  res.redirect('/profile')
})

app.listen(PORT, () => {
  console.log(`Server is running on port : http://localhost:${PORT}`);
});
