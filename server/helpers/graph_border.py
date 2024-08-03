import sys
from PIL import Image, ImageOps
import os

def add_border_to_image(image_path):
    # Open the image
    img = Image.open(image_path)
    
    # Define border width
    border_width = 2
    
    # Add a black border to the image
    bordered_img = ImageOps.expand(img, border=border_width, fill='black')
    
    # Save the bordered image with the same filename
    img_filename = os.path.basename(image_path)
    new_img_path = os.path.join(os.path.dirname(image_path), "bordered_" + img_filename)
    bordered_img.save(new_img_path)
    
    # Replace the original image with the bordered one
    os.remove(image_path)
    os.rename(new_img_path, image_path)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python add_border.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        add_border_to_image(image_path)
        # print("Border added successfully!")
    except Exception as e:
        print("An error occurred:", e)
