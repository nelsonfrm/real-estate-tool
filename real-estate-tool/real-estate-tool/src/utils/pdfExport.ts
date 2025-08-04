import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, fileName: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    // Simple canvas generation
    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Add header with timestamp
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');
    
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated on ${timestamp}`, 10, 10);
    pdf.text('Real Estate Analysis Tool', 10, 15);

    // Save the PDF
    pdf.save(`${fileName.toLowerCase().replace(/\s+/g, '-')}-${now.toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

export const exportMultipleElementsToPDF = async (elementIds: string[], fileName: string) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let isFirstPage = true;

    for (const elementId of elementIds) {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Element with id '${elementId}' not found`);
        continue;
      }

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (!isFirstPage) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      isFirstPage = false;
    }

    // Add header with timestamp
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');
    
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated on ${timestamp}`, 10, 10);
    pdf.text('Real Estate Analysis Tool', 10, 15);

    pdf.save(`${fileName.toLowerCase().replace(/\s+/g, '-')}-${now.toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMsg = error instanceof Error ? error.message : 'Please try again.';
    alert(`Error generating PDF: ${errorMsg}`);
  }
};