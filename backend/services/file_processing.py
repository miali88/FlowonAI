

async def process_file(file: UploadFile) -> str:
    content = ""
    file_extension = file.filename.split('.')[-1].lower()

    if file_extension == 'pdf':
        content = await process_pdf(file)
    elif file_extension in ['docx', 'doc']:
        content = await process_docx(file)
    elif file_extension in ['xlsx', 'xls']:
        content = await process_excel(file)
    elif file_extension == 'txt':
        content = (await file.read()).decode('utf-8')
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

    return content

async def process_pdf(file: UploadFile) -> str:
    pdf_content = await file.read()
    pdf_reader = PdfReader(io.BytesIO(pdf_content))
    return "\n".join(page.extract_text() for page in pdf_reader.pages)

async def process_docx(file: UploadFile) -> str:
    docx_content = await file.read()
    doc = Document(io.BytesIO(docx_content))
    return "\n".join(paragraph.text for paragraph in doc.paragraphs)

async def process_excel(file: UploadFile) -> str:
    excel_content = await file.read()
    workbook = load_workbook(filename=io.BytesIO(excel_content))
    content = []
    for sheet in workbook.sheetnames:
        ws = workbook[sheet]
        content.append(f"Sheet: {sheet}")
        for row in ws.iter_rows(values_only=True):
            content.append("\t".join(str(cell) for cell in row if cell is not None))
    return "\n".join(content)