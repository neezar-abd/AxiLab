import mongoose from 'mongoose'

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })
    
    console.log('✅ MongoDB connected successfully')
    
    // Event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected')
    })
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}

export default connectDB
