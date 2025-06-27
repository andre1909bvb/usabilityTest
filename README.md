# 🧪 AI-Powered Playwright Test Generator for SauceDemo

This project automatically generates end-to-end Playwright tests for [saucedemo.com](https://www.saucedemo.com).  
It uses OpenAI to create test scripts dynamically, validate selectors, and document expected behavior.

## 🚀 Features

- **AI Test Generation**  
  Generates Playwright tests via GPT-4, based on predefined prompts.
- **Login Automation**  
  Logs in with `standard_user / secret_sauce`.
- **Shopping Cart Workflows**  
  Adds and removes items, verifies cart contents.
- **Dynamic Selectors**  
  Loads selectors from `selectors.json` if available.
- **Enhanced Assertions**  
  Provides detailed error messages with actual vs. expected values.
- **Error Logging**  
  Saves error stack traces in `test-results/errors`.
- **Readable Descriptions**  
  Generates step-by-step test explanations in Markdown format.

## 📂 Project Structure

- `/generated`  
  Contains generated `.spec.js` Playwright test files and corresponding `.txt` descriptions.
- `selectors.json`  
  Optional list of known selectors to improve test accuracy.
- `.env`  
  Must include your `OPENAI_API_KEY`.

## ⚙️ Requirements

- Node.js >= 16
- Playwright
- An OpenAI API key

## 🛠️ Installation

```bash
npm install
