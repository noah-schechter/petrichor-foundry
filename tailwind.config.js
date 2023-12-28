/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/index.html"],
  theme: {
    extend: {
      colors: {
        olive: '#394C2F',
        sage: '#B5BDB2'
        // Add more cust
    },
    fontFamily: {
      'jetbrains': ['JETBRAINS', 'monospace'],
    },
  },
  plugins: [],
}
}

