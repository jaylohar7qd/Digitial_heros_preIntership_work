document.addEventListener('DOMContentLoaded', () => {
  const auditForm = document.getElementById('audit-form');
  const urlInput = document.getElementById('url-input');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');
  
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const closeError = document.getElementById('close-error');
  
  const skeletonLoader = document.getElementById('skeleton-loader');
  const resultsDashboard = document.getElementById('results-dashboard');
  
  // Dashboard fields
  const resultUrl = document.getElementById('result-url');
  const badgeStatus = document.getElementById('badge-status');
  const badgeTime = document.getElementById('badge-time');
  
  // Score Ring
  const scoreRing = document.getElementById('score-ring');
  const scoreNumber = document.getElementById('score-number');
  const scoreGrade = document.getElementById('score-grade');
  
  // Metrics values
  const valSpeed = document.getElementById('val-speed');
  const descSpeed = document.getElementById('desc-speed');
  const valWords = document.getElementById('val-words');
  const descWords = document.getElementById('desc-words');
  const valH1 = document.getElementById('val-h1');
  const descH1 = document.getElementById('desc-h1');
  const valAlt = document.getElementById('val-alt');
  const descAlt = document.getElementById('desc-alt');
  
  // Audit Checklist items
  const auditItemTitle = document.getElementById('audit-item-title');
  const detailTitle = document.getElementById('detail-title');
  const feedbackTitle = document.getElementById('feedback-title');
  
  const auditItemMeta = document.getElementById('audit-item-meta');
  const detailMeta = document.getElementById('detail-meta');
  const feedbackMeta = document.getElementById('feedback-meta');
  
  const auditItemImages = document.getElementById('audit-item-images');
  const detailImages = document.getElementById('detail-images');
  const feedbackImages = document.getElementById('feedback-images');
  const missingImagesPreview = document.getElementById('missing-images-preview');
  const missingImagesList = document.getElementById('missing-images-list');

  // Dismiss Error banner
  closeError.addEventListener('click', () => {
    errorMessage.classList.add('hidden');
  });

  // Handle Form Submission
  auditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let url = urlInput.value.trim();
    if (!url) return;

    // Client-side quick prefix format
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
    }

    try {
      new URL(url);
    } catch (_) {
      showError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    // Set Loading State
    setLoading(true);
    
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        renderDashboard(data);
      } else {
        showError(data.error || 'Failed to analyze the page. Please verify the URL and try again.');
      }
    } catch (err) {
      showError('Unable to connect to the auditing server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Auditing...';
      spinner.classList.remove('hidden');
      errorMessage.classList.add('hidden');
      resultsDashboard.classList.add('hidden');
      skeletonLoader.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Analyze Page';
      spinner.classList.add('hidden');
      skeletonLoader.classList.add('hidden');
    }
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.remove('hidden');
    resultsDashboard.classList.add('hidden');
    skeletonLoader.classList.add('hidden');
    window.scrollTo({ top: errorMessage.offsetTop - 50, behavior: 'smooth' });
  }

  function renderDashboard(data) {
    // 1. Set URL & Badges
    resultUrl.textContent = data.url;
    resultUrl.title = data.url;
    
    // Status Badge
    const isOk = data.status >= 200 && data.status < 300;
    badgeStatus.className = `badge ${isOk ? 'badge-success' : 'badge-danger'}`;
    badgeStatus.innerHTML = `<i data-lucide="${isOk ? 'check-circle-2' : 'alert-circle'}"></i><span class="badge-label">HTTP ${data.status} ${data.statusText || ''}</span>`;
    
    // Response Speed Badge
    badgeTime.innerHTML = `<i data-lucide="clock"></i><span class="badge-label">${data.responseTime}ms response</span>`;

    // 2. Compute Health Score
    const score = calculateScore(data);
    scoreNumber.textContent = score;

    // Animate Score Ring: Circumference is 264
    const offset = 264 - (264 * score) / 100;
    scoreRing.style.strokeDashoffset = offset;

    // Set score grading colors
    if (score >= 80) {
      scoreGrade.textContent = 'Excellent';
      scoreGrade.className = 'score-grade label-success';
      scoreRing.style.stroke = 'var(--success)';
    } else if (score >= 50) {
      scoreGrade.textContent = 'Needs Work';
      scoreGrade.className = 'score-grade label-warning';
      scoreRing.style.stroke = 'var(--warning)';
    } else {
      scoreGrade.textContent = 'Poor';
      scoreGrade.className = 'score-grade label-danger';
      scoreRing.style.stroke = 'var(--danger)';
    }

    // 3. Render Metric Cards
    // Speed
    valSpeed.innerHTML = `${data.responseTime}<span class="unit">ms</span>`;
    if (data.responseTime < 300) {
      descSpeed.textContent = 'Lightning fast response. Excellent hosting performance.';
      descSpeed.className = 'metric-desc text-success';
    } else if (data.responseTime < 1000) {
      descSpeed.textContent = 'Moderate response time. Consider optimizing server load.';
      descSpeed.className = 'metric-desc text-warning';
    } else {
      descSpeed.textContent = 'Slow response time. Highly recommended to optimize performance.';
      descSpeed.className = 'metric-desc text-danger';
    }

    // Word Count
    valWords.textContent = data.wordCount.toLocaleString();
    if (data.wordCount >= 600) {
      descWords.textContent = 'Robust text length. Good depth for SEO visibility.';
      descWords.className = 'metric-desc text-success';
    } else if (data.wordCount >= 300) {
      descWords.textContent = 'Healthy content length. Average page text density.';
      descWords.className = 'metric-desc text-warning';
    } else {
      descWords.textContent = 'Thin content. Adding more descriptive paragraphs is recommended.';
      descWords.className = 'metric-desc text-danger';
    }

    // H1 Headers
    valH1.textContent = data.h1Count;
    if (data.h1Count === 1) {
      descH1.textContent = 'Perfect structure. Exactly one primary heading.';
      descH1.className = 'metric-desc text-success';
    } else if (data.h1Count === 0) {
      descH1.textContent = 'Missing H1 tag. A main title header is critical.';
      descH1.className = 'metric-desc text-danger';
    } else {
      descH1.textContent = 'Multiple H1 tags. Best practice is to use exactly one.';
      descH1.className = 'metric-desc text-warning';
    }

    // Missing Alt Images
    const missingAltCount = data.imagesMissingAlt.count;
    valAlt.textContent = missingAltCount;
    if (missingAltCount === 0) {
      descAlt.textContent = 'Optimal accessibility. Every image has alternative text.';
      descAlt.className = 'metric-desc text-success';
    } else {
      descAlt.textContent = `${missingAltCount} image${missingAltCount > 1 ? 's are' : ' is'} missing alt text descriptions.`;
      descAlt.className = 'metric-desc text-danger';
    }

    // 4. Update Checklist Items
    // Title Tag
    const titleVal = data.title;
    if (titleVal) {
      detailTitle.textContent = `"${titleVal}"`;
      const titleLen = titleVal.length;
      if (titleLen >= 10 && titleLen <= 60) {
        setAuditItemStatus(auditItemTitle, 'success', `Perfect length (${titleLen} characters). Ideal SEO titles should be between 10 and 60 characters.`);
      } else {
        setAuditItemStatus(auditItemTitle, 'warning', `Length is ${titleLen} characters. It is recommended to keep page titles between 10 and 60 characters for optimal search appearance.`);
      }
    } else {
      detailTitle.textContent = 'No Title Found';
      setAuditItemStatus(auditItemTitle, 'danger', 'This page does not have a `<title>` tag. Search engines require a title to index and present your site.');
    }

    // Meta Description
    const metaVal = data.metaDescription;
    if (metaVal) {
      detailMeta.textContent = `"${metaVal}"`;
      const metaLen = metaVal.length;
      if (metaLen >= 50 && metaLen <= 160) {
        setAuditItemStatus(auditItemMeta, 'success', `Ideal length (${metaLen} characters) for displaying in search engine results snippets.`);
      } else {
        setAuditItemStatus(auditItemMeta, 'warning', `Length is ${metaLen} characters. Best practice suggests keeping descriptions between 50 and 160 characters.`);
      }
    } else {
      detailMeta.textContent = 'No Meta Description Found';
      setAuditItemStatus(auditItemMeta, 'danger', 'The page is missing a `<meta name="description">` tag. Adding one improves click-through rates from search results.');
    }

    // Images alt list
    if (missingAltCount === 0) {
      detailImages.textContent = 'All images on this page include descriptive alternate text.';
      setAuditItemStatus(auditItemImages, 'success', 'Excellent for search engines indexing and screen reader accessibility.');
      missingImagesPreview.classList.add('hidden');
    } else {
      detailImages.textContent = `${missingAltCount} image${missingAltCount > 1 ? 's' : ''} missing alt descriptions.`;
      setAuditItemStatus(auditItemImages, 'danger', 'Search bots and screen readers cannot read image contexts without alternate text tags.');
      
      // Load samples
      missingImagesList.innerHTML = '';
      data.imagesMissingAlt.samples.forEach(src => {
        const li = document.createElement('li');
        li.textContent = src;
        missingImagesList.appendChild(li);
      });
      missingImagesPreview.classList.remove('hidden');
    }

    // Refresh Lucide Icons
    lucide.createIcons();

    // Show Dashboard
    resultsDashboard.classList.remove('hidden');
    
    // Smooth scroll to results
    window.scrollTo({ top: resultsDashboard.offsetTop - 50, behavior: 'smooth' });
  }

  function setAuditItemStatus(itemElement, status, feedbackText) {
    const iconContainer = itemElement.querySelector('.audit-status-icon');
    const feedbackContainer = itemElement.querySelector('.audit-feedback');
    
    if (status === 'success') {
      iconContainer.innerHTML = '<i data-lucide="check-circle" class="text-success"></i>';
      feedbackContainer.textContent = feedbackText;
      feedbackContainer.className = 'audit-feedback text-success';
    } else if (status === 'warning') {
      iconContainer.innerHTML = '<i data-lucide="help-circle" class="text-warning"></i>';
      feedbackContainer.textContent = feedbackText;
      feedbackContainer.className = 'audit-feedback text-warning';
    } else {
      iconContainer.innerHTML = '<i data-lucide="x-circle" class="text-danger"></i>';
      feedbackContainer.textContent = feedbackText;
      feedbackContainer.className = 'audit-feedback text-danger';
    }
  }

  function calculateScore(data) {
    let score = 100;

    // HTTP status check
    if (data.status !== 200) {
      score -= 30;
    }

    // Response time penalty
    if (data.responseTime > 1000) {
      score -= 25;
    } else if (data.responseTime > 500) {
      score -= 15;
    } else if (data.responseTime > 250) {
      score -= 5;
    }

    // Title tag penalty
    if (!data.title) {
      score -= 15;
    } else {
      const len = data.title.length;
      if (len < 10 || len > 60) {
        score -= 5;
      }
    }

    // Meta description penalty
    if (!data.metaDescription) {
      score -= 15;
    } else {
      const len = data.metaDescription.length;
      if (len < 50 || len > 160) {
        score -= 5;
      }
    }

    // H1 tags check
    if (data.h1Count === 0) {
      score -= 15;
    } else if (data.h1Count > 1) {
      score -= 5;
    }

    // Alt attributes penalty
    const missingAltCount = data.imagesMissingAlt.count;
    if (missingAltCount > 0) {
      const penalty = Math.min(missingAltCount * 3, 10);
      score -= penalty;
    }

    // Word count penalty
    if (data.wordCount < 300) {
      score -= 10;
    } else if (data.wordCount < 100) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }
});
