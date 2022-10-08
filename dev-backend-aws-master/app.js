const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')

// routerss
const authRouter = require('./routes/authRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const subCategoryRouter = require('./routes/subCategoryRoutes')
const productRouter = require('./routes/productRoutes')
const postRouter = require('./routes/postRoutes')
const commentRouter = require('./routes/commentRoutes')
const replyRouter = require('./routes/replyRoutes')
const userRouter = require('./routes/userRoutes')
const agentRouter = require('./routes/agentRoutes')
const farmerRouter = require('./routes/farmerRoutes')
const farmerProductRouter = require('./routes/farmerProductRoutes')
const jobsRouter = require('./routes/jobsRoutes')
const reportFeedRouter = require('./routes/reportFeedRoutes')
const vendorRouter = require('./routes/vendorRoutes')
const cloudinaryRouter = require('./routes/cloudinaryRoutes')
const notificationRouter = require('./routes/notificationRoutes')
const chatRouter = require('./routes/chatRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const cartRouter = require('./routes/cartRoutes')
const couponRouter = require('./routes/couponRoutes')
const quoteRouter = require('./routes/quoteRoutes')
const advertRouter = require('./routes/advertRoutes')
const contactRouter = require('./routes/contactRoutes')
const emailRouter = require('./routes/emailRoutes')
const jobAnswersRouter = require('./routes/jobAnswersRoutes')
const blogRouter = require('./routes/blogRoutes')
const walletRouter = require('./routes/walletRoutes')
const ordersRouter = require('./routes/ordersRoutes')

const app = express()

app.use(cors())
// app.options('*', cors())

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   next()
// })
app.enable('trust proxy')
// app.use(
//   cors({
//     origin: [
//       'http://localhost:3000',
//       'https://tinkoko-react.herokuapp.com',
//       'http://tinkoko-react.herokuapp.com',
//     ],
//     credentials: true,
//   })
// )

app.use(helmet())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Morgan for Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(bodyParser.json({ limit: '200mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message:
      'Tinkoko API. Visit https://www.tinkoko.com/api/documentation for official documentation',
  })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/subCategories', subCategoryRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/replies', replyRouter)
app.use('/api/v1/farmer', farmerRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/agents', agentRouter)
app.use('/api/v1/farmers', farmerRouter)
app.use('/api/v1/farmerProducts', farmerProductRouter)
app.use('/api/v1/jobs', jobsRouter)
app.use('/api/v1/vendors', vendorRouter)
app.use('/api/v1/reportFeeds', reportFeedRouter)
app.use('/api/v1/images', cloudinaryRouter)
app.use('/api/v1/notifications', notificationRouter)
app.use('/api/v1/chats', chatRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/coupons', couponRouter)
app.use('/api/v1/quotes', quoteRouter)
app.use('/api/v1/advert', advertRouter)
app.use('/api/v1/contact', contactRouter)
app.use('/api/v1/emails', emailRouter)
app.use('/api/v1/jobAnswers', jobAnswersRouter)
app.use('/api/v1/blogs', blogRouter)
app.use('/api/v1/wallet', walletRouter)
app.use('/api/v1/orders', ordersRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 400))
})

app.use(globalErrorHandler)

module.exports = app
