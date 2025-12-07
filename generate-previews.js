// Script per generare anteprime PDF
// Richiede: npm install pdf-poppler sharp

const path = require('path');
const fs = require('fs');
const { convert } = require('pdf-poppler');

const pdfDir = path.join(__dirname, 'PDF');
const outputDir = path.join(__dirname, 'image', 'previews');

// Crea directory se non esiste
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Lista dei PDF da convertire
const pdfs = [
    'INFORTUNI SUL LAVORO E MALATTIA PROFESSIONALE.pdf',
    'Invalidità e inabilità.pdf',
    'PENSIONE.pdf',
    'disoccupazione.pdf'
];

async function generatePreviews() {
    for (const pdfFile of pdfs) {
        const pdfPath = path.join(pdfDir, pdfFile);
        
        if (!fs.existsSync(pdfPath)) {
            console.log(`❌ File non trovato: ${pdfFile}`);
            continue;
        }

        try {
            const outputFileName = pdfFile.replace('.pdf', '.png');
            
            const opts = {
                format: 'png',
                out_dir: outputDir,
                out_prefix: path.basename(pdfFile, '.pdf'),
                page: 1, // Solo prima pagina
                scale: 2048 // Alta qualità
            };

            await convert(pdfPath, opts);
            console.log(`✅ Anteprima creata: ${outputFileName}`);
        } catch (error) {
            console.error(`❌ Errore con ${pdfFile}:`, error);
        }
    }
}

generatePreviews().then(() => {
    console.log('✅ Tutte le anteprime sono state generate!');
}).catch(err => {
    console.error('❌ Errore:', err);
});
