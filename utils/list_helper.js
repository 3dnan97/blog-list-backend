const blog = require("../models/blog");
const _ = require('lodash')

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

const mostBlogs = (blogs) => {
    const authorWithMostBlogs = []
    const counts = _.countBy(blogs, 'author')
    const topAuthor = _.maxBy(Object.entries(counts), ([author, count]) => count)

    console.log(counts, topAuthor);
    return{
      author: topAuthor[0],
      blogs: topAuthor[1]
    }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
};
