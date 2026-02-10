import zipfile
import xml.etree.ElementTree as ET
import sys

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

text = get_docx_text('D:/My_CV.docx')
with open('cv_content.txt', 'w', encoding='utf-8') as f:
    f.write(text)

# Search specifically for multicentric
for line in text.split('\n'):
    if 'multicentric' in line.lower():
        print(f"FOUND: {line}")
