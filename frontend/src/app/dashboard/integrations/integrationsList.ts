import { 
  siGooglecalendar,
  siGmail,
  siNotion,
  siWhatsapp,
  siShopify,
  siSlack,
  siGooglescholar,
  siGoogle
} from 'simple-icons'

export const integrations = [
    {
      name: "Google Calendar",
      id: "GOOGLECALENDAR",
      icon: `data:image/svg+xml;utf8,${encodeURIComponent(
        siGooglecalendar.svg.replace('<svg', `<svg fill="#${siGooglecalendar.hex}"`)
      )}`,
      description: "Your agents can see your availability and book meetings",
      category: "Calendar",
      status: "Not Connected",
    },
    {
      name: "Gmail",
      id: "GMAIL",
      icon: `data:image/svg+xml;utf8,${encodeURIComponent(
        siGmail.svg.replace('<svg', `<svg fill="#${siGmail.hex}"`)
      )}`,
      description: "Have drafts responses to customers written and ready to send",
      category: "Email",
      status: "Not connected",
    },
    {
      name: "Notion",
      id: "NOTION",
      icon: `data:image/svg+xml;utf8,${encodeURIComponent(
        siNotion.svg.replace('<svg', `<svg fill="white"`)
      )}`,
      description: "Connect Notion.",
      category: "Communication",
      status: "Not connected",
    },
    {
      name: "Shopify",
      id: "SHOPIFY",
      icon: `data:image/svg+xml;utf8,${encodeURIComponent(
        siShopify.svg.replace('<svg', `<svg fill="#${siShopify.hex}"`)
      )}`,
      description: "Integrate your Shopify store.",
      category: "E-commerce",
      status: "Not connected",
    },
    {
      name: "WhatsApp",
      id: "WHATSAPP",
      icon: `data:image/svg+xml;utf8,${encodeURIComponent(
        siWhatsapp.svg.replace('<svg', `<svg fill="#${siWhatsapp.hex}"`)
      )}`,
      description: "Connect WhatsApp Business API.",
      category: "Communication",
      status: "Coming soon",
    },
    {
      name: "Slack",
      id: "SLACK",
      icon: `data:image/svg+xml;utf8,${encodeURIComponent(
        siSlack.svg.replace('<svg', `<svg fill="#${siSlack.hex}"`)
      )}`,
      description: "Connect with your Slack workspace.",
      category: "Communication",
      status: "See Guide Here",
    },
    {
      name: "Outlook",
      id: "OUTLOOK",
      icon: `/icons/outlook.png`,
      description: "Connect with your Outlook workspace.",
      category: "Communication",
      status: "Coming soon",
    },
  ]
  