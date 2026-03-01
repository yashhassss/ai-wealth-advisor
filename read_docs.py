import zipfile
import xml.etree.ElementTree as ET
import os

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            tree = ET.XML(docx.read('word/document.xml'))
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for paragraph in tree.iterfind('.//w:p', namespaces):
                texts = [node.text for node in paragraph.iterfind('.//w:t', namespaces) if node.text]
                if texts:
                    text.append(''.join(texts))
            return '\n'.join(text)
    except Exception as e:
        return str(e)

docs = [
    "AI-Powered Wealth Advisor – Design Specifications.docx"
]

for doc in docs:
    out_name = doc.replace('.docx', '.txt')
    text = read_docx(doc)
    with open(out_name, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Wrote {out_name}")
