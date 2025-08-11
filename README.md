# Portfolio Hub

A clean, modern portal that hosts multiple functional sub-websites (panels) in a single interface. The main page displays all available panels as sleek square tiles, and each click navigates to the corresponding sub-website.

## 🚀 Features

### Core Features
- **Main Hub Page**: Responsive grid of square panel cards with smooth hover animations
- **Summarizer Panel**: AI-powered text summarization with rich formatting preservation
- **Webhook Integration**: Centralized configuration for external API calls
- **Modern UI/UX**: Clean design with dark mode support and responsive layout

### Technical Features
- **Rich Text Editor**: ContentEditable div with formatting tools (Bold, Italic, Underline)
- **Loading States**: Visual feedback for all async operations
- **Error Handling**: Comprehensive error handling with toast notifications
- **Responsive Design**: Works seamlessly on all screen sizes
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend Framework**: React + Next.js 15 (App Router)
- **UI Library**: Tailwind CSS v4 + ShadCN components
- **Backend Services**: N8N (POST Requests via Webhook)
- **Deployment**: Vercel
- **Additional Packages**: 
  - react-hook-form (form handling)
  - axios (HTTP requests)
  - react-hot-toast (notifications)
  - lucide-react (icons)

## 📁 Project Structure

```
src/
├── app/
│   ├── (hub)/
│   │   └── page.tsx          # Main hub page
│   ├── summarizer/
│   │   └── page.tsx          # Summarizer panel
│   ├── layout.tsx            # Root layout with toast provider
│   └── page.tsx              # Root page (redirects to hub)
├── components/
│   ├── PanelCard.tsx         # Hub panel component
│   ├── RichEditor.tsx        # ContentEditable wrapper
│   └── WebhookButton.tsx     # Standardized webhook trigger
└── lib/
    ├── webhook_config.ts     # All webhook endpoints
    ├── api.ts                # Axios instance with headers
    └── utils.ts              # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm/yarn/pnpm
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 🎨 Design System

### Color Scheme
- **Primary**: slate-900 (background), slate-100 (text)
- **Accent**: violet-600 (buttons, highlights)
- **State**: emerald-500 (success), amber-500 (warning), rose-500 (error)

### Typography
- **Main font**: Inter (via Tailwind)
- **Headings**: font-semibold
- **Body**: font-normal leading-relaxed

### Layout Principles
- 8px baseline grid
- 1.5rem (24px) consistent padding
- Card shadows: md (medium)
- Border radius: lg (0.5rem)

## 🔧 Configuration

### Webhook Configuration
The application uses a centralized webhook configuration system. Edit `src/lib/webhook_config.ts` to add new webhook endpoints:

```typescript
export const WEBHOOKS = {
  summarizer: {
    url: 'http://n8n.thesetwomanager.win/webhook-test/summarizer',
    headers: {
      'CF-Access-Client-Id': 'your-client-id',
      'CF-Access-Client-Secret': 'your-client-secret'
    }
  },
  // Add new webhooks here
  newPanel: {
    url: 'your-webhook-url',
    headers: {
      // your headers
    }
  }
};
```

### Adding New Panels
1. Add the panel configuration to the `panels` array in `src/app/(hub)/page.tsx`
2. Create a new page in `src/app/[panel-name]/page.tsx`
3. Add the webhook configuration to `src/lib/webhook_config.ts`

## 🚀 Deployment

### Vercel Deployment
1. Connect your Git repository to Vercel
2. Set environment variables in Vercel dashboard (if needed)
3. Deploy with default Next.js settings

### Environment Variables
Create a `.env.local` file for local development:
```env
# Add any environment variables here
```

## 📱 Usage

### Main Hub
- Visit the root URL to see all available panels
- Click on any panel card to navigate to the corresponding tool
- Each panel card shows the tool name, description, and icon

### Summarizer Panel
1. Navigate to the Summarizer panel
2. Paste or type your text in the rich text editor
3. Use the formatting tools (Bold, Italic, Underline) if needed
4. Click "Summarize Text" to process your content
5. View the summarized result below
6. Click "Back to Hub" to return to the main page

## 🔮 Future Enhancements

- [ ] Add more functional panels (Image Generator, Code Analyzer, etc.)
- [ ] Implement user authentication
- [ ] Add panel favorites and customization
- [ ] Implement offline support
- [ ] Add analytics and usage tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

Built with ❤️ using Next.js and Tailwind CSS
