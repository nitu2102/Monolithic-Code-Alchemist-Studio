document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const fileName = document.getElementById('fileName');
    const separateBtn = document.getElementById('separateBtn');
    const statusMessage = document.getElementById('statusMessage');
    const previewSection = document.getElementById('previewSection');
    const baseFilename = document.getElementById('baseFilename');
    const htmlPreview = document.getElementById('htmlPreview');
    const cssPreview = document.getElementById('cssPreview');
    const jsPreview = document.getElementById('jsPreview');
    const downloadAllBtn = document.getElementById('downloadAllBtn');

    let uploadedFile = null;
    let baseName = '';
    let separatedFiles = {
        html: '',
        css: '',
        js: ''
    };

    // Event listeners for drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('highlight');
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('highlight');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('highlight');
        
        if (e.dataTransfer.files.length) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFileSelection(this.files[0]);
        }
    });

    separateBtn.addEventListener('click', function() {
        if (uploadedFile) {
            separateFiles(uploadedFile);
        }
    });

    downloadAllBtn.addEventListener('click', function() {
        downloadAllFiles();
    });

    // Event delegation for download buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('download-file-btn')) {
            const type = e.target.getAttribute('data-type');
            downloadSingleFile(type);
        }
    });

    function handleFileSelection(file) {
        if (file.type === 'text/html' || file.name.endsWith('.html')) {
            uploadedFile = file;
            baseName = file.name.replace(/\.html$/i, '');
            fileName.textContent = `✨ Selected spellbook: ${file.name}`;
            fileName.classList.remove('hidden');
            separateBtn.disabled = false;
            statusMessage.classList.add('hidden');
            previewSection.classList.add('hidden');
            
            showStatus('Spellbook accepted! Ready to begin the alchemical process.', 'success');
        } else {
            showStatus('Please select a valid HTML spellbook to begin the ritual.', 'error');
        }
    }

    function separateFiles(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                showStatus('🔮 The alchemical process has begun...', 'success');
                
                const htmlContent = e.target.result;
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                
                // Extract CSS from style tags
                const styleTags = doc.querySelectorAll('style');
                let cssContent = '';
                
                styleTags.forEach(tag => {
                    cssContent += tag.textContent + '\n';
                    tag.remove();
                });
                
                // Extract JavaScript from script tags
                const scriptTags = doc.querySelectorAll('script');
                let jsContent = '';
                
                scriptTags.forEach(tag => {
                    if (!tag.src) {
                        jsContent += tag.textContent + '\n';
                        tag.remove();
                    }
                });
                
                // Add link to CSS in head
                const head = doc.querySelector('head');
                if (head) {
                    const link = doc.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = `${baseName}.css`;
                    head.appendChild(link);
                }
                
                // Add script reference before closing body tag
                const body = doc.querySelector('body');
                if (body) {
                    const script = doc.createElement('script');
                    script.src = `${baseName}.js`;
                    body.appendChild(script);
                }
                
                // Get cleaned HTML
                const cleanedHtml = doc.documentElement.outerHTML;
                
                // Wrap CSS and JS with comments
                const wrappedCss = `/* --- CSS Aura extracted by Code Alchemist Studio --- */\n${cssContent}\n/* --- End of purified CSS essence --- */`;
                const wrappedJs = `// --- JS Animations extracted by Code Alchemist Studio ---\n${jsContent}\n// --- End of distilled JS magic ---`;
                
                // Store separated files
                separatedFiles = {
                    html: cleanedHtml,
                    css: wrappedCss,
                    js: wrappedJs
                };
                
                // Update previews
                baseFilename.textContent = baseName;
                htmlPreview.textContent = cleanedHtml;
                cssPreview.textContent = wrappedCss;
                jsPreview.textContent = wrappedJs;
                
                // Show preview section
                previewSection.classList.remove('hidden');
                
                showStatus('✨ The alchemical process is complete! Three pure elements have been revealed.', 'success');
                
            } catch (error) {
                console.error('Error processing file:', error);
                showStatus('The ritual was interrupted. Please check your HTML spellbook and try again.', 'error');
            }
        };
        
        reader.onerror = function() {
            showStatus('The ancient texts could not be read. Please try another spellbook.', 'error');
        };
        
        reader.readAsText(file);
    }

    function downloadSingleFile(type) {
        if (!separatedFiles[type]) {
            showStatus('No purified elements are ready for claiming yet.', 'error');
            return;
        }

        const content = separatedFiles[type];
        const extensions = {
            html: '.html',
            css: '.css',
            js: '.js'
        };
        
        const filename = `${baseName}${extensions[type]}`;
        const mimeTypes = {
            html: 'text/html',
            css: 'text/css',
            js: 'text/javascript'
        };
        
        downloadFile(content, filename, mimeTypes[type]);
        showStatus(`✨ ${type.toUpperCase()} essence claimed successfully!`, 'success');
    }

    function downloadAllFiles() {
        if (!separatedFiles.html) {
            showStatus('No purified elements are ready for claiming yet.', 'error');
            return;
        }

        // Download HTML
        downloadFile(separatedFiles.html, `${baseName}.html`, 'text/html');
        
        // Download CSS
        setTimeout(() => {
            downloadFile(separatedFiles.css, `${baseName}.css`, 'text/css');
        }, 100);
        
        // Download JS
        setTimeout(() => {
            downloadFile(separatedFiles.js, `${baseName}.js`, 'text/javascript');
        }, 200);
        
        showStatus('🎉 All three purified elements have been claimed! Your magical creation awaits.', 'success');
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message';
        
        if (type === 'success') {
            statusMessage.classList.add('status-success');
        } else if (type === 'error') {
            statusMessage.classList.add('status-error');
        }
        
        statusMessage.classList.remove('hidden');
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 5000);
        }
    }
});