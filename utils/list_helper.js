const blog = require("../models/blog");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => sum + blog.likes
    return blogs.reduce(reducer,0) || 0
}

const favoriteBlog = (blogs) => {
    const {title, author, likes} = blogs.reduce((fav, blog) => 
        blog.likes > fav.likes ? blog : fav, blogs[0])
    return {title, author, likes}
}
//return to it at the end of part 4
// const mostBlogs = (blogs) => {
//     const authorWithMostBlogs = []
//     blogs.reduce((author, blog)=>{
//         console.log(author[blog.author], blog);
        
//     },{}) 
//     console.log(authorWithMostBlogs);
    
// }

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  //mostBlogs
};
