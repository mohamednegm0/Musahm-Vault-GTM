using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Kernel.Colors;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Geom;
using iText.IO.Font.Constants;
using iText.Kernel.Font;
using iText.Layout.Properties;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.Fonts;

using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using DocumentFormat.OpenXml;

namespace Service.Helpers;

public static class WatermarkHelper
{
    public static byte[] ApplyWatermark(byte[] fileContent, string watermarkText, string contentType, string fileName)
    {
        if (fileContent == null || fileContent.Length == 0) return Array.Empty<byte>();

        // Check for PDF Magic Number (%PDF)
        bool isPdfHeader = fileContent.Length > 4 && 
                           fileContent[0] == 0x25 && fileContent[1] == 0x50 && 
                           fileContent[2] == 0x44 && fileContent[3] == 0x46;

        contentType = contentType?.ToLower() ?? "";
        string extension = System.IO.Path.GetExtension(fileName)?.ToLower() ?? "";

        if (isPdfHeader || contentType.Contains("pdf") || extension == ".pdf")
        {
            return ApplyPdfWatermark(fileContent, watermarkText);
        }
        else if (contentType.StartsWith("image/") || new[] { ".jpg", ".jpeg", ".png", ".bmp" }.Contains(extension))
        {
            return ApplyImageWatermark(fileContent, watermarkText);
        }
        else if (contentType.Contains("word") || extension == ".docx" || extension == ".doc")
        {
             return ApplyWordWatermark(fileContent, watermarkText);
        }

        return fileContent;
    }

    private static byte[] ApplyWordWatermark(byte[] fileContent, string text)
    {
        try 
        {
            using var ms = new MemoryStream();
            ms.Write(fileContent, 0, fileContent.Length);
            
            using (WordprocessingDocument doc = WordprocessingDocument.Open(ms, true))
            {
                if (doc.MainDocumentPart == null) return fileContent;

                var headerPart = doc.MainDocumentPart.HeaderParts.FirstOrDefault();
                if (headerPart == null)
                {
                    headerPart = doc.MainDocumentPart.AddNewPart<HeaderPart>();
                    string rId = doc.MainDocumentPart.GetIdOfPart(headerPart);
                    
                    var sectPr = doc.MainDocumentPart.Document?.Body?.Descendants<SectionProperties>().FirstOrDefault();
                    if (sectPr != null)
                    {
                        sectPr.RemoveAllChildren<HeaderReference>();
                        sectPr.PrependChild(new HeaderReference() { Id = rId, Type = HeaderFooterValues.Default });
                    }
                }

                if (headerPart.Header == null) headerPart.Header = new Header();
                
                // Create VML Shape for Diagonal Watermark
                var run = new DocumentFormat.OpenXml.Wordprocessing.Run();
                var picture = new DocumentFormat.OpenXml.Wordprocessing.Picture();
                var shape = new DocumentFormat.OpenXml.Vml.Shape()
                {
                    Id = "MusahmVaultWatermark",
                    Style = "position:absolute;margin-left:0;margin-top:0;width:500pt;height:150pt;z-index:-251658240;mso-wrap-edited:f;mso-position-horizontal:center;mso-position-horizontal-relative:margin;mso-position-vertical:center;mso-position-vertical-relative:margin;rotation:315",
                    Type = "#_x0000_t136", // WordArt type
                    FillColor = "red", // Red Color
                    Stroked = new DocumentFormat.OpenXml.TrueFalseValue(false)
                };

                var fill = new DocumentFormat.OpenXml.Vml.Fill() { Opacity = "50%" }; // Semi-transparent
                var textPath = new DocumentFormat.OpenXml.Vml.TextPath()
                {
                    String = text,
                    Style = "font-family:'Arial';font-size:1pt;font-weight:bold"
                };

                shape.Append(fill);
                shape.Append(textPath);
                picture.Append(shape);
                run.Append(picture);
                
                var paragraph = new DocumentFormat.OpenXml.Wordprocessing.Paragraph(run);
                
                headerPart.Header.Append(paragraph);
                headerPart.Header.Save();
            }

            return ms.ToArray();
        }
        catch (Exception ex)
        {
             Console.WriteLine($"Word Watermark Error: {ex.Message}");
             return fileContent;
        }
    }

    private static byte[] ApplyPdfWatermark(byte[] fileContent, string text)
    {
        try 
        {
            using var readerStream = new MemoryStream(fileContent);
            using var writerStream = new MemoryStream();
            
            // SetUnethicalReading allows reading encrypted docs (owner password)
            PdfReader pdfReader = new PdfReader(readerStream).SetUnethicalReading(true);
            PdfWriter pdfWriter = new PdfWriter(writerStream);
            PdfDocument pdfDoc = new PdfDocument(pdfReader, pdfWriter);
            
            PdfFont font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
            int n = pdfDoc.GetNumberOfPages();
            
            for (int i = 1; i <= n; i++)
            {
                PdfPage page = pdfDoc.GetPage(i);
                iText.Kernel.Geom.Rectangle pageSize = page.GetPageSize();
                float x = pageSize.GetWidth() / 2;
                float y = pageSize.GetHeight() / 2;
                
                PdfCanvas over = new PdfCanvas(page);
                over.SaveState();
                
                // 1. Draw Big Red Box
                over.SetStrokeColor(iText.Kernel.Colors.ColorConstants.RED);
                over.SetLineWidth(5);
                over.Rectangle(20, 20, pageSize.GetWidth() - 40, pageSize.GetHeight() - 40);
                over.Stroke();

                // 2. Draw Text
                over.SetFillColor(iText.Kernel.Colors.ColorConstants.RED);
                iText.Kernel.Pdf.Extgstate.PdfExtGState gs1 = new iText.Kernel.Pdf.Extgstate.PdfExtGState().SetFillOpacity(0.5f);
                over.SetExtGState(gs1);
                
                using (var canvas = new iText.Layout.Canvas(over, pageSize))
                {
                    canvas.ShowTextAligned(new iText.Layout.Element.Paragraph(text)
                        .SetFont(font)
                        .SetFontSize(50)
                        .SetFontColor(iText.Kernel.Colors.ColorConstants.RED),
                        x, y, i, iText.Layout.Properties.TextAlignment.CENTER, iText.Layout.Properties.VerticalAlignment.MIDDLE, (float)Math.PI / 4);
                }
                
                over.RestoreState();
            }
            
            pdfDoc.Close();
            return writerStream.ToArray();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"PDF Watermark Error: {ex.Message}");
            // Return original content if watermark fails
            return fileContent;
        }
    }

    private static byte[] ApplyImageWatermark(byte[] fileContent, string text)
    {
        try
        {
            using var image = SixLabors.ImageSharp.Image.Load(fileContent);
            
            SixLabors.Fonts.Font? font = null;
            if (SystemFonts.Collection.Families.Any())
            {
                var families = SystemFonts.Collection.Families.ToList();
                SixLabors.Fonts.FontFamily family;
                var found = families.FirstOrDefault(f => f.Name.Contains("Arial", StringComparison.OrdinalIgnoreCase));
                if (found != default) family = found;
                else family = families.First();
                
                font = family.CreateFont(image.Height / 15f, SixLabors.Fonts.FontStyle.Bold);
            }

            if (font != null)
            {
                var validFont = (SixLabors.Fonts.Font)font;
                image.Mutate(ctx => 
                {
                    var size = TextMeasurer.MeasureSize(text, new TextOptions(validFont));
                    ctx.DrawText(text, validFont, SixLabors.ImageSharp.Color.Red.WithAlpha(0.6f), new PointF((image.Width - size.Width) / 2, (image.Height - size.Height) / 2));
                });
            }

            using var ms = new MemoryStream();
            image.Save(ms, image.Metadata.DecodedImageFormat ?? SixLabors.ImageSharp.Formats.Png.PngFormat.Instance);
            return ms.ToArray();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"--- DEBUG IMAGE ERROR: {ex.Message}");
            return fileContent;
        }
    }
}
