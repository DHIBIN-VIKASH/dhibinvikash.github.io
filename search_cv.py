import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    try:
        document = zipfile.ZipFile(path)
        xml_content = document.read('word/document.xml')
        document.close()
        tree = ET.fromstring(xml_content)
        
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for paragraph in tree.findall('.//w:p', ns):
            texts = [node.text for node in paragraph.findall('.//w:t', ns) if node.text]
            if texts:
                paragraphs.append("".join(texts))
        
        return "\n".join(paragraphs)
    except Exception as e:
        return str(e)

# Search for "multicentric" or "trial" specifically
text = get_docx_text('D:/My_CV.docx')
lines = text.split('\n')
relevant = [l for l in lines if 'multicentric' in l.lower() or 'trial' in l.lower()]
print("--- Relevant CV lines ---")
for r in relevant:
    print(r)
