#  Page Pulse — Web Page Auditor

> *Think of it as a health check for any website. You hand it a URL, it tells you everything worth knowing about that page — in seconds.*

** Live Demo:** [https://digitial-heros-preintership-work-2.onrender.com](https://digitial-heros-preintership-work-2.onrender.com)

---

##  Hey, what is this?

Imagine you just built a website and you want to know:

- Does my page have a proper title?
- Did I forget to add a description for Google?
- Are my headings set up correctly?
- Are there any images that screen readers can't understand?
- How many words does my page have?
- How fast does it respond?

**Page Pulse** answers all of these questions for you — instantly.

You paste a URL, hit **Audit**, and get a clear JSON report back. No sign‑ups, no accounts, no fuss.

---

##  Features at a glance

| **Feature Checked**         | **Purpose / Why It Matters**                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page Title**              | Every webpage should have a unique and descriptive title. It helps search engines understand the page and is displayed in browser tabs and search results. |
| **Meta Description**        | A brief summary of the webpage that often appears below the page title in search engine results, helping users understand the page content.                |
| **H1 Heading Count**        | The main heading of a webpage. SEO best practice is to have exactly one `<h1>` tag that clearly describes the page's primary topic.                        |
| **Images Without Alt Text** | Detects images missing the `alt` attribute. Alt text improves accessibility for screen readers and provides context if an image fails to load.             |
| **Word Count**              | Estimates the amount of textual content on the page, giving an indication of the page's content depth.                                                     |
| **Response Time**           | Measures how long the server takes to respond to the request (in milliseconds). Faster response times generally provide a better user experience.          |
| **HTTP Status Code**        | Indicates whether the webpage was successfully retrieved (e.g., `200 OK`) or encountered an error (e.g., `404 Not Found`, `500 Internal Server Error`).    |

---

## 🖥️ Try it live right now

1. Open **[https://digitial-heros-preintership-work-2.onrender.com](https://digitial-heros-preintership-work-2.onrender.com)** in your browser.
2. Type (or paste) any website URL in the text box — for example:
   ```
   https://example.com
   ```
3. Click **Audit**.
4. Wait a second or two while the server fetches the page.
5. The result appears below the button as a JSON object — easy to read!

---

## 📦 Run it on your own computer

Want to run your own copy? Here is how, step by step.

### 1 — Prerequisites

Make sure you have:
- **Node.js v22 or newer** — [Download here](https://nodejs.org/)
- **npm** — comes bundled with Node.js
- **Git** — [Download here](https://git-scm.com/)

### 2 — Clone the repository

```bash
git clone https://github.com/jaylohar7qd/Digitial_heros_preIntership_work.git
cd Digitial_heros_preIntership_work
```

### 3 — Install dependencies

```bash
npm install
```

This downloads Express, axios, Cheerio, and the other small libraries the project uses.

### 4 — Configure the port (optional)

Open the `.env` file in the project root. It looks like this:

```
PORT=3001
```

Change `3001` to any port number you like. If you skip this step, the server will use port `3001` by default.

### 5 — Start the server

```bash
npm start
```

You will see:

```
Server is running on http://localhost:3001
```

### 6 — Open the app

Open your browser and go to `http://localhost:3001`. The same UI you see on the live site is now running on your machine.

---

## 🔌 API reference

You can also call the API directly — useful for scripts, Postman, or integration with other tools.

### Endpoint

```
POST /api/audit
```

### Request

Send a JSON body with one field:

```json
{
  "url": "https://example.com"
}
```

### Successful response

```json
{
  "success": true,
  "url": "https://example.com/",
  "status": 200,
  "statusText": "OK",
  "responseTime": 312,
  "title": "Example Domain",
  "metaDescription": null,
  "h1Count": 1,
  "imagesMissingAlt": {
    "count": 0,
    "samples": []
  },
  "wordCount": 67
}
```

### Error response (e.g., bad URL, timeout, non‑HTML page)

```json
{
  "success": false,
  "error": "The domain name could not be resolved (DNS lookup failed).",
  "responseTime": 8003
}
```

### Try it with curl

```bash
curl -X POST https://digitial-heros-preintership-work-2.onrender.com/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

---

## 🏗️ Project structure

```
project_root/
│
├── Project              ← The heart of the app — Express server + audit logic
├── package.json         ← Project info and dependency list
├── .env                 ← Environment config (PORT)
├── .gitignore           ← Files to keep out of Git
├── README.md            ← This file
│
├── public/
│   └── index.html       ← The simple front-end (input box + button + result)
│
└── .well-known/
    └── appspecific/
        └── com.chrome.devtools.json   ← Stops Chrome DevTools from showing a warning
```

---

## 🔍 How it works — under the hood

Here is the journey of a single audit, explained like a story:

### Step 1 — You click "Audit"
Your browser takes the URL you typed and sends it to the server:
```
POST /api/audit  →  { "url": "https://example.com" }
```

### Step 2 — Server cleans up the URL
Before doing anything, the server checks that the URL is valid:
- Trims any leading/trailing spaces.
- If you didn't type `http://` or `https://`, it adds `http://` for you.
- Runs it through the built‑in `URL` constructor to check it's actually a valid web address. If not, it immediately returns an error.

### Step 3 — Server fetches the page
Using **axios** (a popular HTTP library), the server sends a request to your target URL. It:
- Uses a realistic browser‑like *User‑Agent* header so most sites don't block it.
- Waits a maximum of **8 seconds** before giving up.
- Follows up to 5 redirects (e.g., `http://` → `https://`).
- Accepts **any** HTTP status code (so it can even audit a 404 page).

### Step 4 — Checks what came back
The server confirms the response is an HTML page. If it's a PDF, an image, or a file download — it stops and sends an error back because those can't be audited.

### Step 5 — Analyses the HTML
The HTML body is loaded into **Cheerio** — think of it as jQuery running on the server. Cheerio lets the server navigate the page structure just like a browser would. It:
- Removes all non‑visible parts (scripts, styles, iframes, etc.) so the word count only reflects real content.
- Reads the `<title>` tag.
- Reads the `<meta name="description">` or Open Graph description.
- Counts all `<h1>` tags.
- Loops through every `<img>` tag and flags any that are missing an `alt` attribute, storing up to 5 example URLs.
- Grabs the remaining text and counts the words.

### Step 6 — Sends the report back
Everything collected is wrapped into a JSON object and sent back to your browser. The front‑end renders it in a `<pre>` block for easy reading.

### Step 7 — Errors are handled gracefully
If anything goes wrong at any point (slow server, DNS failure, non‑HTML response), the server catches it and sends back a clear, human‑readable error message rather than crashing or hanging.

---

## 🚀 Deployment

This project is deployed on **[Render](https://render.com)**.

Live URL: **[https://digitial-heros-preintership-work-2.onrender.com](https://digitial-heros-preintership-work-2.onrender.com)**

Render automatically:
- Clones the repository.
- Runs `npm install`.
- Starts the server with `npm start`.
- Provides a public URL with HTTPS.

If you want to deploy your own copy to Render:
1. Fork the repository on GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Connect your forked repository.
4. Set the **Start Command** to `npm start`.
5. Add an environment variable `PORT` if needed (Render sets its own `PORT` automatically).

---

## 🛠️ Tech stack
| **Technology** | **Purpose / Role**                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Node.js**    | JavaScript runtime environment used to build and run the backend server efficiently.                                                             |
| **Express.js** | Lightweight web framework for Node.js that manages API routes, middleware, and HTTP requests/responses.                                          |
| **Axios**      | HTTP client used to fetch the HTML content of the target webpage for analysis.                                                                   |
| **Cheerio**    | Server-side HTML parsing library that provides jQuery-like syntax to extract elements such as the title, meta description, headings, and images. |
| **dotenv**     | Loads environment variables from a `.env` file, allowing sensitive configuration (e.g., API keys or ports) to be managed securely.               |
| **CORS**       | Enables Cross-Origin Resource Sharing, allowing the frontend application to communicate with the backend API from different origins.             |

---

## 🧩 Common errors and what they mean

| **Error Message**                | **Cause**                                                                              | **Solution / Fix**                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `URL is required`                | The form was submitted without entering any URL.                                       | Enter a valid URL in the input field before submitting.                                     |
| `Invalid URL format`             | The entered URL is not in a valid format or cannot be parsed.                          | Use a properly formatted URL, for example: `https://example.com`.                           |
| `The request timed out`          | The target website did not respond within the allowed 8-second time limit.             | Try again later or test with a faster responding website.                                   |
| `DNS lookup failed`              | The domain name does not exist, is misspelled, or cannot be resolved.                  | Check the URL spelling and make sure the website exists.                                    |
| `Non-HTML response`              | The provided URL points to a non-HTML resource such as a PDF, image, or file download. | Provide a webpage URL that returns HTML content. Page Pulse only audits HTML pages.         |
| `EADDRINUSE` (Local Development) | Port `3001` is already being used by another process on your machine.                  | Change the `PORT` value in the `.env` file or stop the process currently using port `3001`. |


---

## 🤝 Contributing

Ideas for new features or improvements are always welcome!

1. **Fork** the repository on GitHub.
2. Create a **feature branch**: `git checkout -b feature/my-new-idea`
3. Make your changes.
4. **Commit**: `git commit -m "Add: description of my change"`
5. **Push** and open a **pull request**.

### Ideas for future improvements

- [ ] Add SEO score (0–100) based on the collected metrics
- [ ] Check for canonical tags, robots meta, Open Graph images
- [ ] Improve the UI with charts, colour‑coded scores, and dark mode
- [ ] Add PDF / CSV export of audit results
- [ ] Write automated tests for the audit logic
- [ ] Support batch auditing (multiple URLs at once)

---

## 📄 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

Built as part of the **Digital Heroes Pre‑Internship Work** programme.

GitHub: [@jaylohar7qd](https://github.com/jaylohar7qd)

---

*Happy auditing! If anything breaks or you have a question, open an issue on GitHub.* 🚀
