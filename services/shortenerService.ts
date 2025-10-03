// A simple function to validate a URL format
const isValidUrl = (urlString: string): boolean => {
  // A more robust regex can be used, but this covers common cases.
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(urlString);
};

// Mock function to simulate shortening a URL
export const shortenUrl = (longUrl: string, alias?: string, customDomain?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!longUrl.trim()) {
        reject(new Error("URL cannot be empty."));
        return;
    }

    if (!isValidUrl(longUrl)) {
        reject(new Error("Please enter a valid URL (e.g., https://example.com)."));
        return;
    }
    
    // Simulate a database of taken aliases
    const takenAliases = new Set(['promo', 'launch', 'test', 'free', 'offer']);

    if (alias) {
        const cleanAlias = alias.trim();
        const aliasRegex = /^[a-zA-Z0-9_-]+$/; // Allow letters, numbers, underscore, hyphen
        if (!aliasRegex.test(cleanAlias)) {
            reject(new Error("Alias can only contain letters, numbers, hyphens, and underscores."));
            return;
        }
        if (takenAliases.has(cleanAlias.toLowerCase())) {
            reject(new Error(`Alias '${cleanAlias}' is already taken. Please try another one.`));
            return;
        }
    }


    // Simulate network delay of 1.2 seconds
    setTimeout(() => {
      let shortCode = '';
      if (alias?.trim()) {
        shortCode = alias.trim();
      } else {
        const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 7; i++) {
          shortCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
      }

      let baseUrl = 'https://shrtco.de';
      if (customDomain?.trim()) {
        const cleanDomain = customDomain.trim().replace(/^(https?:\/\/)/, '');
        baseUrl = `https://${cleanDomain}`;
      }

      resolve(`${baseUrl}/${shortCode}`);
    }, 1200);
  });
};