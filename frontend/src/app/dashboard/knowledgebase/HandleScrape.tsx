import axios from "axios";
import { toast } from 'sonner';

interface HandleScrapeProps {
  scrapeUrl: string;
  setScrapeError: (error: string) => void;
  getToken: () => Promise<string>;
  user: { id: string };
  API_BASE_URL: string;
  setNewItemContent: React.Dispatch<React.SetStateAction<string>>;
  setShowScrapeInput: (show: boolean) => void;
  setScrapeUrl: (url: string) => void;
  setMappedUrls: React.Dispatch<React.SetStateAction<string[]>>;
  selectedUrls: string[];
}

export const handleScrape = async ({
  scrapeUrl,
  setScrapeError,
  getToken,
  API_BASE_URL,
  setNewItemContent,
  setShowScrapeInput,
  setScrapeUrl,
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
    const response = await axios.post(`${API_BASE_URL}/knowledge_base/crawl_url`, 
      { url: scrapeUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (Array.isArray(response.data)) {
      setMappedUrls(response.data);
      if (response.data.length === 0) {
        toast.warning("No URLs found to map");
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
      toast.success("Content scraped successfully");
    } else {
      throw new Error("Unexpected response format from server");
    }
  } catch (error) {
    console.error("Error scraping URL:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(`Failed to scrape URL: ${errorMessage}`);
  }
};

export const handleScrapeAll = async ({
  getToken,
  API_BASE_URL,
  setNewItemContent,
  setShowScrapeInput,
  setScrapeUrl,
  selectedUrls,
}: Omit<HandleScrapeProps, 'mappedUrls' | 'setMappedUrls' | 'scrapeUrl' | 'setScrapeError' | 'user'> & { selectedUrls: string[] }) => {
  try {
    console.log('=== Starting handleScrapeAll ===');
    console.log('Selected URLs:', selectedUrls);
    console.log('API Endpoint:', `${API_BASE_URL}/knowledge_base/scrape_web`);

    const token = await getToken();
    console.log('Token obtained successfully');

    const requestData = { urls: selectedUrls };
    console.log('Request payload:', requestData);

    const response = await axios.post(
      `${API_BASE_URL}/knowledge_base/scrape_web`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Response received:', response);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    if (response.data.message === "completed") {
      toast.success("URLs added to your library");
      setShowScrapeInput(false);
      setScrapeUrl("");
      return true;
    }

    if (!response.data) {
      throw new Error("No response data received from server");
    }

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
    toast.success("All pages scraped successfully");
  } catch (error) {
    console.error("Error scraping URLs:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(`Failed to scrape URLs: ${errorMessage}`);
  }
};
