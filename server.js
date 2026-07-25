const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to estimate word count
function estimateWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

app.post('/api/audit', async (req, res) => {
  let { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  // Trim and append protocol if missing
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid URL format. Please enter a valid URL (e.g., https://example.com)' });
  }

  const startTime = Date.now();

  try {
    const response = await axios.get(parsedUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PagePulse/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: () => true // Resolve promise for any status code (so we can audit 404, 500 pages)
    });

    const responseTime = Date.now() - startTime;

    // Check if content is HTML
    const contentType = response.headers['content-type'] || '';
    if (!contentType.toLowerCase().includes('text/html')) {
      return res.status(400).json({
        success: false,
        error: `URL returned a non-HTML response (${contentType.split(';')[0] || contentType}). Page Pulse can only audit HTML web pages.`
      });
    }

    const html = response.data;
    if (typeof html !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Failed to retrieve readable HTML content from the page.'
      });
    }

    const $ = cheerio.load(html);

    // Remove tags that do not contain reader-visible text before calculating word count
    const parseTree = $('html').clone();
    parseTree.find('script, style, iframe, noscript, svg, code, head, link, meta').remove();

    const title = $('title').first().text().trim() || null;
    
    // Extract meta description
    let metaDescription = null;
    metaDescription = $('meta[name="description"]').attr('content') || 
                      $('meta[name="Description"]').attr('content') ||
                      $('meta[property="og:description"]').attr('content') ||
                      null;
    
    if (metaDescription) {
      metaDescription = metaDescription.trim();
    }

    const h1Count = $('h1').length;

    // Count images missing alt text and gather samples
    let missingAltCount = 0;
    const missingAltSamples = [];
    $('img').each((idx, el) => {
      const alt = $(el).attr('alt');
      const src = $(el).attr('src');
      if (alt === undefined || alt === null || alt.trim() === '') {
        missingAltCount++;
        if (missingAltSamples.length < 5 && src) {
          try {
            const absoluteSrc = new URL(src, parsedUrl.href).href;
            missingAltSamples.push(absoluteSrc);
          } catch (e) {
            missingAltSamples.push(src);
          }
        }
      }
    });

    const bodyText = parseTree.text();
    const wordCount = estimateWordCount(bodyText);

    return res.json({
      success: true,
      url: parsedUrl.href,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      title,
      metaDescription,
      h1Count,
      imagesMissingAlt: {
        count: missingAltCount,
        samples: missingAltSamples
      },
      wordCount
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorMessage = 'An error occurred while fetching the URL.';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'The request timed out (limit: 8 seconds).';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'The domain name could not be resolved (DNS lookup failed).';
    } else if (error.response) {
      errorMessage = `HTTP error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(200).json({
      success: false,
      error: errorMessage,
      responseTime
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
