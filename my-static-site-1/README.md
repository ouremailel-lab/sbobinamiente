# My Static Site

This is a simple static site project that demonstrates the use of HTML, CSS, and JavaScript. 

## Project Structure

```
my-static-site
├── src
│   ├── index.html       # Main HTML document
│   ├── styles
│   │   └── main.css     # CSS styles for the site
│   └── scripts
│       └── app.js       # JavaScript for interactivity
├── package.json         # npm configuration file
└── README.md            # Project documentation
```

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the necessary dependencies by running:
   ```
   npm install
   ```

## Deployment

To deploy the site using Surge, follow these steps:

1. Make sure you have Surge installed globally. If not, install it using:
   ```
   npm install --global surge
   ```
2. Build your project if necessary (for example, if you are using a build tool).
3. Deploy your site by running:
   ```
   surge ./src
   ```

## License

This project is licensed under the MIT License.