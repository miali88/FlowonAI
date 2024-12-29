import Image from 'next/image'

export default function BubbleGuidePage() {
  return (
    <article className="prose prose-invert max-w-4xl mx-auto p-6">
      <h1>Bubble</h1>
      
      <section>
        <h2>Step 1: Set Up Your Flowon AI Chatbot</h2>
        <p>
          To integrate your Flowon AI chatbot into your Bubble application, start by accessing your 
          Flowon AI account. If you're new to the platform, you can create a free account to get 
          started. Once logged in, you can build your bot within the Flowon AI platform by importing 
          various data sources, including files, text content, websites, or Q&A pairs, which will 
          serve as the foundation for your bot's knowledge base.
        </p>
        <p>Here's a clear guide for implementing your Flowon AI chatbot.</p>
      </section>
      
      <section>
        <h2>Step 2: Access and Copy Your Flowon AI Chatbot Embed Code</h2>
        <p>
          Each chatbot created on Flowon AI comes with its own unique embed code for website 
          integration. After configuring your chatbot on Flowon AI, go to your Dashboard page and 
          locate the specific bot you want to connect with your Bubble application.
        </p>
        <p>1. Within the dashboard, choose the agent you plan to deploy to Bubble IO.</p>

        <Image src="/guide/bubble/1.png" alt="Flowon AI Dashboard" width={800} height={400} />

        <p>2. You'll land on the select agent's page. Proceed to click on the Deploy tab on the nav bar.</p>

        <Image src="/guide/bubble/2.png" alt="Flowon AI Dashboard" width={800} height={400} />

        <p>3. Up next, a new page should come up, click on Copy Script to copy the code snippet.</p>
        <Image src="/guide/bubble/3.png" alt="Flowon AI Dashboard" width={800} height={400} />
      </section>

      <section>
        <h2>Step 3: Embed Flowon Chatbot Agent on Your Bubble App</h2>
        <p>
          1. Now that you've copied the embed code, sign into your Bubble account and head to your account dashboard.
        </p>
        <Image src="/guide/bubble/4.png" alt="Flowon AI Dashboard" width={800} height={400} />

        <p>2. On your dashboard, pick out the Bubble app or website you wish to embed the chatbot on and click the Launch Editor button next to it.</p>
        <Image src="/guide/bubble/5.png" alt="Flowon AI Dashboard" width={800} height={400} />

        <p>3. Once your Bubble Editor comes up, scroll down to the section of the page you want to add the embed code.</p>
        <p>4. On the left sidebar of the editor, locate the HTML component and drag it to the section of the page.</p>
        <Image src="/guide/bubble/6.png" alt="Flowon AI Dashboard" width={800} height={400} />

        <p>5. Double-click on the HTML component to reveal the code editor.</p>
        <p>6. Paste the embed code on the editor and you should automatically see a floating chatbot icon on the bottom left corner of the editing canvas.</p>
        <Image src="/guide/bubble/7.png" alt="Flowon AI Dashboard" width={800} height={400} />

        <p>7. You now have a powerful AI agent embedded on to your website! You can now test your chatbot by clicking on the chatbot icon.</p>
      </section>



    </article>
  )
}
