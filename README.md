# Barelytics Supabase Backend Setup

## 1. Prerequisites
- Node.js installed
- Supabase account and project created ([supabase.com](https://supabase.com/))

## 2. Install Dependencies
```
npm install
```

## 3. Configure Environment Variables
Create a `.env` file in the project root:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```
Replace with your actual Supabase project credentials.

## 4. Start the Server
```
node index.js
```

## 5. Test the API
Visit [http://localhost:3000/test](http://localhost:3000/test) to test the sample endpoint (make sure you have a `test_table` in your Supabase database).

## 6. Customization
- Edit `index.js` to add more endpoints or logic.
- Use `supabaseClient.js` to interact with your Supabase backend. 