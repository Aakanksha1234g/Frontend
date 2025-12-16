import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function generatePDF(projectData) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const slides = projectData.project_slides;
  let i = 0;

  while (i < slides.length) {
    const slide = slides[i];

    // Handle lookbook slides
    if (slide.slide_type === 'lookbook') {
      // Collect all lookbook images starting from this one
      const lookbookImages = [];
      while (i < slides.length && slides[i].slide_type === 'lookbook') {
        if (slides[i].slide_image) {
          lookbookImages.push(slides[i].slide_image);
        }
        i++;
      }

      const totalPages = Math.ceil(lookbookImages.length / 9);

      for (let page = 0; page < totalPages; page++) {
        const container = document.createElement('div');
        container.style.width = '1000px';
        container.style.padding = '20px';
        container.style.backgroundColor = '#ffffff';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)';
        container.style.gridGap = '10px';

        const title = document.createElement('h2');
        title.innerText = 'LOOKBOOK';
        title.style.gridColumn = 'span 3';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        container.appendChild(title);

        const imagesForPage = lookbookImages.slice(page * 9, (page + 1) * 9);
        imagesForPage.forEach(base64Img => {
          const img = document.createElement('img');
          img.src = `data:image/jpeg;base64,${base64Img}`;
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.objectFit = 'cover';
          container.appendChild(img);
        });

        document.body.appendChild(container);
        const canvas = await html2canvas(container, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (page > 0 || i > 9) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
        document.body.removeChild(container);
      }

      continue;
    }

    // Default slide layout
    const slideElem = document.createElement('div');
    slideElem.style.backgroundColor = '#000000';
    slideElem.style.color = '#ffffff';
    slideElem.style.padding = '20px';
    slideElem.style.width = '1000px';
    slideElem.style.height = '700px'; // Approx A4 landscape
    slideElem.style.display = 'flex';
    slideElem.style.flexDirection = 'column';
    slideElem.style.boxSizing = 'border-box';

    const title = document.createElement('h1');
    title.innerText = projectData.project_name
      ?.toUpperCase()
      .replace(/_/g, ' ');
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';
    slideElem.appendChild(title);

    if (slide?.slide_type !== 'main') {
      const subtitle = document.createElement('h2');
      subtitle.innerText = slide.slide_type?.toUpperCase().replace(/_/g, ' ');
      subtitle.style.textAlign = 'center';
      subtitle.style.marginBottom = '20px';
      slideElem.appendChild(subtitle);
    }

    const content = document.createElement('div');
    content.style.flex = '1';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';

    if (slide?.slide_image || slide?.slide_description) {
      const contentWrapper = document.createElement('div');
      contentWrapper.style.flex = '1';
      contentWrapper.style.display = 'grid';
      contentWrapper.style.gridTemplateRows = '60% 40%';
      contentWrapper.style.gap = '20px';

      // IMAGE BLOCK
      const imageContainer = document.createElement('div');
      imageContainer.style.display = 'flex';
      imageContainer.style.justifyContent = 'center';
      imageContainer.style.alignItems = 'center';
      imageContainer.style.backgroundColor = '#1a1a1a';
      imageContainer.style.border = '1px solid #333';
      imageContainer.style.borderRadius = '8px';
      imageContainer.style.padding = '10px';

      if (slide?.slide_image) {
        const img = document.createElement('img');
        img.src = `data:image/jpeg;base64,${slide.slide_image}`;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        imageContainer.appendChild(img);
      } else {
        const noImg = document.createElement('p');
        noImg.innerText = 'No image available';
        noImg.style.color = '#aaa';
        noImg.style.fontStyle = 'italic';
        imageContainer.appendChild(noImg);
      }

      // DESCRIPTION BLOCK
      const descContainer = document.createElement('div');
      descContainer.style.backgroundColor = '#111';
      descContainer.style.border = '1px solid #333';
      descContainer.style.borderRadius = '8px';
      descContainer.style.padding = '15px';
      descContainer.style.color = '#ffffff';
      descContainer.style.font = '16px/1.5 Arial, sans-serif';
      descContainer.style.overflow = 'hidden';
      descContainer.style.textAlign = 'left';

      const desc = document.createElement('p');
      desc.innerText = slide?.slide_description || 'No description provided.';
      desc.style.margin = '0';

      descContainer.appendChild(desc);
      contentWrapper.appendChild(imageContainer);
      contentWrapper.appendChild(descContainer);

      slideElem.appendChild(contentWrapper);
    }

    slideElem.appendChild(content);

    document.body.appendChild(slideElem);
    const canvas = await html2canvas(slideElem, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    document.body.removeChild(slideElem);

    i++; // move to next slide
  }

  pdf.save(`${projectData?.project_name}.pdf`);
}

export default generatePDF;
