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
    console.error("Error scraping URL:", error);
    setScrapeError(error.response?.data?.detail || error.message || "Failed to scrape URL");
    setAlertMessage("Failed to scrape URL: " + (error.response?.data?.detail || error.message));
    setAlertType("error");
  }
};

// Add this new function
export const handleScrapeAll = async ({
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
  selectedUrls,
}: Omit<HandleScrapeProps, 'mappedUrls' | 'setMappedUrls'> & { selectedUrls: string[] }) => {
  try {
    // Add debug log
    console.log('Selected URLs being sent:', selectedUrls);

    const token = await getToken();
    const response = await axios.post(
      `${API_BASE_URL}/dashboard/scrape_web`,
      { urls: selectedUrls },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-ID': user.id,
        },
      }
    );

    // Add debug log
    console.log('Response from server:', response.data);

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
    console.error("Error scraping URLs:", error);
    // Add more detailed error logging
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    setScrapeError(error.response?.data?.detail || error.message || "Failed to scrape URLs");
    setAlertMessage("Failed to scrape URLs: " + (error.response?.data?.detail || error.message));
    setAlertType("error");
    return false; // Add this to indicate failure
  }
};
