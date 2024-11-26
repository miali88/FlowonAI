import axios from 'axios';

interface HandleScrapeProps {
  scrapeUrl: string;
  setScrapeError: (error: string) => void;
  getToken: () => Promise<string>;
  user: { id: string };
  API_BASE_URL: string;
  setNewItemContent: React.Dispatch<React.SetStateAction<string>>;
  setShowScrapeInput: (show: boolean) => void;
  setScrapeUrl: (url: string) => void;
  setAlertMessage: (message: string) => void;
  setAlertType: (type: string) => void;
  setMappedUrls: React.Dispatch<React.SetStateAction<string[]>>;
  selectedUrls: string[];
}

// Add this type definition at the top of the file
type ApiError = {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
    headers?: Record<string, string>;
  };
  request?: XMLHttpRequest;
  message: string;
  name: string;
};

export const handleScrape = async ({
  scrapeUrl,
  setScrapeError,
  getToken,
  user,
  API_BASE_URL,
  setNewItemContent,
  setShowScrapeInput,
  setScrapeUrl,
  setAlertMessage,
  setAlertType,
  setMappedUrls,
  selectedUrls,
}: HandleScrapeProps) => {
  setScrapeError("");

  // Basic URL validation
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlPattern.test(scrapeUrl)) {
    setScrapeError("Please enter a valid URL");
    return;
  }

  try {
    const token = await getToken();
    const response = await axios.post(`${API_BASE_URL}/dashboard/crawl_url`, 
      { url: scrapeUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-ID': user.id,
        },
      }
    );
    
    if (Array.isArray(response.data)) {
      setMappedUrls(response.data);
      if (response.data.length === 0) {
        setAlertMessage("No URLs found to map");
        setAlertType("warning");
      }
    } else if (selectedUrls.length > 0) {
      // Handle the scraped content when URLs are selected
      if (!response.data.content) {
        throw new Error("No content received from the server");
      }
      setNewItemContent(prevContent => {
        const separator = prevContent ? '\n\n' : '';
        return prevContent + separator + response.data.content;
      });
      setShowScrapeInput(false);
      setScrapeUrl("");
      setAlertMessage("Content scraped successfully");
      setAlertType("success");
    } else {
      throw new Error("Unexpected response format from server");
    }
  } catch (error) {
    const e = error as ApiError;
    console.error("Error scraping URL:", e);
    setScrapeError(e.response?.data?.detail || e.message || "Failed to scrape URL");
    setAlertMessage("Failed to scrape URL: " + (e.response?.data?.detail || e.message));
    setAlertType("error");
  }
};

// Add this new function
export const handleScrapeAll = async ({
  setScrapeError,
  getToken,
  user,
  API_BASE_URL,
  setNewItemContent,
  setShowScrapeInput,
  setScrapeUrl,
  setAlertMessage,
  setAlertType,
  selectedUrls,
}: Omit<Omit<HandleScrapeProps, 'mappedUrls' | 'setMappedUrls'>, 'scrapeUrl'> & { selectedUrls: string[] }) => {
  try {
    console.log('=== Starting handleScrapeAll ===');
    console.log('User ID:', user.id);
    console.log('Selected URLs:', selectedUrls);
    console.log('API Endpoint:', `${API_BASE_URL}/dashboard/scrape_web`);

    const token = await getToken();
    console.log('Token obtained successfully');

    const requestData = { urls: selectedUrls };
    console.log('Request payload:', requestData);

    const response = await axios.post(
      `${API_BASE_URL}/dashboard/scrape_web`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-ID': user.id,
        },
      }
    );

    console.log('Response received:', response);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    // Modified response handling
    if (response.data.message === "completed") {
      setAlertMessage("URLs added to your library");
      setAlertType("success");
      setShowScrapeInput(false);
      setScrapeUrl("");
      return true; // Add this to indicate success
    }

    // Check if response.data exists before accessing content
    if (!response.data) {
      throw new Error("No response data received from server");
    }

    // Handle both possible response formats
    const content = response.data.content || response.data;
    if (!content) {
      throw new Error("No content received from the server");
    }

    setNewItemContent(prevContent => {
      const separator = prevContent ? '\n\n' : '';
      return prevContent + separator + content;
    });
    
    setShowScrapeInput(false);
    setScrapeUrl("");
    setAlertMessage("All pages scraped successfully");
    setAlertType("success");
  } catch (error) {
    const e = error as ApiError;
    console.error('=== Error in handleScrapeAll ===');
    console.error('Error object:', e);
    console.error('Error name:', e.name);
    console.error('Error message:', e.message);
    if (e.response) {
      console.error('Response status:', e.response.status);
      console.error('Response headers:', e.response.headers);
      console.error('Response data:', e.response.data);
    }
    if (e.request) {
      console.error('Request details:', e.request);
    }
    setScrapeError(e.response?.data?.detail || e.message || "Failed to scrape URLs");
    setAlertMessage("Failed to scrape URLs: " + (e.response?.data?.detail || e.message));
    setAlertType("error");
    return false; // Add this to indicate failure
  }
};
