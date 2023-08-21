import os
import time
import win32com.client
import pyautogui
import PyPDF2

def print_xlsx_to_pdf(xlsx_path, metadata):
    # Create Excel application object
    excel_app = win32com.client.Dispatch("Excel.Application")
    excel_app.Visible = False

    try:
        # Open the XLSX file
        workbook = excel_app.Workbooks.Open(xlsx_path)

        # Print to PDF
        pdf_path = xlsx_path.replace(".xlsx", ".pdf")
        workbook.ExportAsFixedFormat(0, pdf_path)

        # Close the workbook without saving
        workbook.Close(False)

        # Add metadata to the PDF
        with open(pdf_path, "rb+") as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            pdf_writer = PyPDF2.PdfWriter()

            for page in pdf_reader.pages:
                pdf_writer.add_page(page)
            
            pdf_writer.add_metadata(metadata)
            
            with open(pdf_path, "wb") as updated_pdf:
                pdf_writer.write(updated_pdf)
    except Exception as e:
        print(f"Error processing {xlsx_path}: {e}")
    finally:
        # Quit Excel application
        excel_app.Quit()

def close_save_output_dialog():
    # Wait for the dialog to appear
    time.sleep(2)
    
    # Simulate key presses to close the dialog
    pyautogui.press("enter")
    time.sleep(1)
    pyautogui.hotkey("alt", "n")
    time.sleep(1)
    pyautogui.press("esc")

def main():
    folder_path = "D:\\Personal\\My Projects\\result-scrapper\\public\\xlsx"  # Replace with the folder path containing XLSX files

    xlsx_files = [file for file in os.listdir(folder_path) if file.lower().endswith(".xlsx")]

    # PDF metadata
    metadata = {
        "/Title": "Consolidated Marklist",
        "/Author": "Arjun Krishna",
        "/Subject": "University Examination Results",

        "/CreationDate": time.strftime("%Y%m%d%H%M%S", time.gmtime()),
        "/ModDate": time.strftime("%Y%m%d%H%M%S", time.gmtime()),

        "/Creator": "MGU Result Scraper v3.0",
        "/Producer": "Inovus Labs IEDC"
    }

    for xlsx_file in xlsx_files:
        xlsx_path = os.path.join(folder_path, xlsx_file)
        
        # Simulate key presses to print using Microsoft Print to PDF
        pyautogui.hotkey("ctrl", "p")
        close_save_output_dialog()  # Close the "Save Output As" dialog
        time.sleep(1)
        
        # Print the XLSX to PDF and save to same location with metadata
        print_xlsx_to_pdf(xlsx_path, metadata)
        
        print(f"{xlsx_file} printed and saved as PDF with metadata.")

if __name__ == "__main__":
    main()

