# FeelBetterAI

## Project Overview
FeelBetterAI is a web application built with Node.js and Express, designed to provide a platform for users to manage their mental well-being. The application utilizes a MySQL database for data storage and retrieval.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Database Configuration](#database-configuration)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd FeelBetterAI
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the development server, run:
```
npm run dev
```
For production, build the project and start the server:
```
npm run build
npm start
```

## Database Configuration
This project is configured to use a MySQL database. Update the database connection details in `src/server/db/mysql.ts` with your Infinity Free hosting credentials.

## Scripts
- `dev`: Starts the application in development mode.
- `build`: Compiles the application for production.
- `start`: Runs the compiled application.
- `check`: Checks TypeScript types.
- `db:push`: Pushes database schema changes.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.