# Smart Password Generator

A responsive password generator built with **HTML5, CSS3, and vanilla JavaScript**.

## Run the project
1. Extract `Smart_Password_Generator.zip`.
2. Open the extracted folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code **Live Server** extension.
4. Click **Generate secure password**.

No backend, API key, package installation, or database is required.

## Assignment requirements covered
- [x] Cryptographically secure random generation using `crypto.getRandomValues()`
- [x] User-defined password length slider (8–64 characters)
- [x] Uppercase, lowercase, numbers, and symbols filters
- [x] Guarantees at least one character from each selected set
- [x] Unbiased character selection using rejection sampling
- [x] Secure shuffle of the generated password
- [x] One-click copy to clipboard using Clipboard API
- [x] Fallback copy method for local development
- [x] Animated feedback toast notifications
- [x] Validation when no character type is selected
- [x] Password strength indicator
- [x] Responsive layout and accessible labels

## Project structure
```text
Smart_Password_Generator/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```

## Security notes
- Passwords are generated locally in the browser and are not transmitted to a server.
- The Web Crypto API is used instead of `Math.random()`.
- Clipboard access generally requires HTTPS or localhost. The project includes a fallback for browsers that do not expose the Clipboard API.
- The strength label is an estimate for user guidance, not a formal password audit.

## Skills demonstrated
JavaScript logic · DOM manipulation · Clipboard API · Event listeners · Randomization · Input validation · Responsive CSS
