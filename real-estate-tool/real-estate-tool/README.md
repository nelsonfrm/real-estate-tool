# Real Estate Analysis Tool

A professional web application for real estate financial analysis, featuring two powerful tools:

1. **Cash Flow Optimizer** - Rental portfolio analysis with occupancy rates, delinquency tracking, and ROI optimization
2. **IRR Model** - Development project analyzer with IRR calculations, NPV analysis, and sensitivity testing

## Features

- 📊 Interactive charts and visualizations using Recharts
- 🎛️ Real-time parameter adjustments with sliders and inputs
- 📱 Responsive design with sidebar navigation
- 📄 PDF export functionality for professional reports
- 💰 Euro (€) currency formatting
- ⚠️ Reality check alerts for unrealistic assumptions
- 📈 Sensitivity analysis and scenario modeling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository or extract the project files
2. Navigate to the project directory:
   ```bash
   cd real-estate-tool
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Quick Deploy

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Vercel at [vercel.com](https://vercel.com)
3. Vercel will automatically deploy your application

### Manual Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your deployment

### Environment Variables

No environment variables are required for this application.

## Project Structure

```
real-estate-tool/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── CashFlowOptimizer.tsx
│   │   └── IRRModel.tsx
│   └── utils/
│       └── pdfExport.ts
├── vercel.json
├── package.json
└── README.md
```

## Cash Flow Optimizer Features

- **Portfolio Parameters**: Occupancy rate, delinquency rate, total units, average rent
- **Advanced Settings**: Operating expense ratio, debt service ratio, CapEx reserves
- **Key Metrics**: Monthly NOI, cash flow, ROI calculations
- **Visualizations**: 
  - ROI optimization by occupancy rate
  - Delinquency impact analysis
  - Monthly cash flow projections
  - Revenue breakdown pie chart

## IRR Model Features

- **Project Parameters**: Unit mix, pricing, development timeline
- **Cost Parameters**: Land acquisition, construction costs, soft costs, contingency
- **Financial Parameters**: Debt-to-equity ratio, interest rates, equity investment
- **Analysis Tools**:
  - Annual cash flow projections
  - Price sensitivity analysis
  - Reality check alerts
  - Industry benchmark comparisons

## PDF Export

Both tools include PDF export functionality that captures:
- All charts and visualizations
- Current parameter settings
- Calculated results and metrics
- Professional formatting with timestamps

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PDF Export**: html2canvas + jsPDF
- **Deployment**: Vercel

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.

---

Built with ❤️ for professional real estate analysis