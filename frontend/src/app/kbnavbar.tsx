// ... existing imports ...
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ... existing code ...

function KnowledgeBaseNavBar({ activeTab, setActiveTab }) {
  const navItems = ["Items", "Categories", "Settings"];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
      <TabsList>
        {navItems.map((item) => (
          <TabsTrigger key={item.toLowerCase()} value={item.toLowerCase()}>
            {item}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function KnowledgeBaseContent() {
  // ... existing state ...
  const [activeTab, setActiveTab] = useState('items');

  // ... existing useEffect and functions ...

  return (
    <div className="flex h-full">
      {/* Left section (1/3 width) */}
      <div className="w-1/3 p-4 border-r">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Knowledge Library</h3>
          <Button size="sm" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Item
          </Button>
        </div>
        <KnowledgeBaseNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabsContent value="items">
          {/* Existing content for items */}
          <div className="mb-4">
            <Input 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <p>Total Tokens: {totalTokens}</p>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            {/* ... existing items list ... */}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="categories">
          <p>Categories content goes here</p>
        </TabsContent>
        <TabsContent value="settings">
          <p>Settings content goes here</p>
        </TabsContent>
      </div>

      {/* Right section (2/3 width) */}
      <div className="w-2/3 p-4">
        {/* ... existing right section content ... */}
      </div>
    </div>
  );
}

// ... rest of the existing code ...