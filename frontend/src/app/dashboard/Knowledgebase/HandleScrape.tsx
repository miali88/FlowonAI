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
  setAlertType
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
    const response = await axios.post(`${API_BASE_URL}/dashboard/scrape_url`, 
      { url: scrapeUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-ID': user.id,
        },
      }
    );
    
    // Handle the scraped content (add it to newItemContent)
    setNewItemContent(prevContent => {
      const separator = prevContent ? '\n\n' : '';
      return prevContent + separator + response.data.content;
    });
    setShowScrapeInput(false);
    setScrapeUrl("");
    setAlertMessage("Content scraped successfully");
    setAlertType("success");
  } catch (error) {
    console.error("Error scraping URL:", error);
    setAlertMessage("Failed to scrape URL: " + (error.response?.data?.detail || error.message));
    setAlertType("error");
  }
};
