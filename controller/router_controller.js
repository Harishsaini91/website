
const user_info = require("../models/User");
const product_model = require("../models/product_range");
const single_product_img_model = require("../models/single_product_img");
const product_extra_image_model = require("../models/product_extra_image");
const slide2_model = require("../models/slide2");
const top_slide_image_model = require("../models/top_slide_image");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { constants } = require("buffer");




// 
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/sign_in');
};

//  ...
const home_page = async (req, res) => {
  // console.log('dddd'); 

  const slides = await top_slide_image_model.find();
  const slides2 = await slide2_model.find();

  const userRole = req.session.userRole || null;


  res.render('home_page', { slides, slides2, userRole })
}

const product_details_page = async (req, res) => {
  const imageName = req.query.image;
  const slides = await top_slide_image_model.find();

  const extra_image = await product_extra_image_model.find({ product_name: imageName });
  const userRole = req.session.userRole || null;


  console.log(extra_image);


  res.render('product_details', { imageName, extra_image, slides, userRole })
}


const about_page = async (req, res) => {
  res.render('aboutus')
}

const product_page = async (req, res) => {
  const category = req.query.category;

  const slides = await top_slide_image_model.find();
  const product = await product_model.find();
  const single_product_img = await single_product_img_model.find();
 

  const userRole = req.session.userRole || null;

 
  // console.log(product[0].indoor, 'aa');

  res.render('product_page', { slides, product, userRole, category , single_product_img})
}





//  register / sign in 
const sign_in_page = async (req, res) => {
  res.render('sign_in')
}

const securePassword = async (password) => {
  try {
    const hashpassword = await bcrypt.hash(password, 10);
    return hashpassword;
  } catch (error) {
    console.log(error.message);
  }
}

const sign_in_page_post = async (req, res) => {
  const gmail = req.body.gmail;
  const original_password = req.body.password;
  const action = req.body.action;
  try {
    if (action === 'register') {

      const bcrypt_password = await securePassword(original_password);
      // console.log(bcrypt_password);

      const user_info_data = new user_info({
        password: bcrypt_password,
        gmail: gmail,
        is_admin: 1,
      });

      const check_user_data = await user_info_data.save();
      console.log("register data save db");

      res.redirect('/sign_in');
    }
    if (action === 'login') {
      const { gmail, password } = req.body;
      const user = await user_info.findOne({ gmail });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send("Invalid credentials");
      }

      // console.log(user._id);

      req.session.userId = user._id;
      req.session.userRole = user.role;
      req.session.save(err => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).send("Internal server error");
        }
        res.redirect('/home');
      });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).send("Internal server error");
  }
};


// ,....
const top_slide_image = async (req, res) => {
  try {
    // const uploadedFiles = req.files;  
    const images = req.files.map(file => file.filename);
    const slide1 = req.body.slide1;
    const slide2 = req.body.slide2;


    // Save each image in the database
    if (slide1 == 1) {
      const imageData = images.map(image => ({ name: image }));
      await top_slide_image_model.insertMany(imageData);
    }
    if (slide2 == 2) {
      const imageData = images.map(image => ({ name: image }));
      await slide2_model.insertMany(imageData);
    }

    console.log("Images uploaded successfully");
    res.redirect('/home');
  } catch (err) {
    console.error("Error uploading images:", err);
    res.status(500).send("Internal Server Error");
  }
};

const product = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    const product_images = req.files?.map(file => file.filename) || [];
    let number = req.body.number;
    const single_img = req.body.single_img;
    let G_number = req.body.G_number;
    let category = ""; // Default empty string

    console.log("Number:", number, "Single Img:", single_img, "G_number:", G_number);

    if (!["1", "2", "3", "4", "5"].includes(number)) {
      number = null;
    }

    console.log("Final number after validation:", number);

    if (number) {
      let product = await product_model.findOne();
      if (!product) {
        product = new product_model();
        await product.save();
      }

      switch (number) {
        case "1":
          category = "indoor";
          product.indoor.push(...product_images);
          break;
        case "2":
          category = "outdoor";
          product.outdoor.push(...product_images);
          break;
        case "3":
          category = "counter";
          product.counter.push(...product_images);
          break;
        case "4":
          category = "art";
          product.art.push(...product_images);
          break;
        case "5":
          category = "other";
          product.other.push(...product_images);
          break;
        default:
          console.error("Invalid category number:", number);
      }

      await product.save();
      console.log("Images successfully uploaded and saved:", product_images);
    } else {
      console.error("Invalid number value, skipping DB save.");
    }

    if (single_img === "single_img") {
      if (!["1", "2", "3", "4", "5"].includes(G_number)) {
        G_number = undefined;
      }

      console.log("Final number after validation:", G_number);

      if (G_number) {
        let product = await single_product_img_model.findOne();
        if (!product) {
          product = new single_product_img_model();
          await product.save();
        }

        switch (G_number) { // ✅ Fixed variable here
          case "1":
            category = "indoor";
            product.indoor.push(...product_images);
            break;
          case "2":
            category = "outdoor";
            product.outdoor.push(...product_images);
            break;
          case "3":
            category = "counter";
            product.counter.push(...product_images);
            break;
          case "4":
            category = "art";
            product.art.push(...product_images);
            break;
          case "5":
            category = "other";
            product.other.push(...product_images);
            break;
          default:
            console.error("Invalid category number in G_number:", G_number);
        }

        await product.save();
        console.log("Images successfully uploaded and saved:", product_images);
      } else {
        console.error("Invalid number value, skipping DB save.");
      }
    }

    // Ensure category is valid before redirection
    if (!category) {
      category = "indoor"; // Set a valid fallback category
    }

    res.redirect(`/product?category=${category}`);
  } catch (error) {
    console.error("Error processing images:", error);
  }
};




// 

const product_extra_image = async (req, res) => {
  try {
    const product_extra_image = req.files.map(file => file.filename); // Get all filenames of the uploaded images
    const product_name = req.body.extra_image;  // The name of the product passed from the form



    // Find the product based on the name
    let product = await product_extra_image_model.findOne({ product_name });

    if (!product) {
      // If product doesn't exist, create a new one
      product = new product_extra_image_model({
        extra_image_name: product_extra_image,  // Store the images in the array
        product_name: product_name,
      });
      await product.save(); // Save the new product document
    } else {
      // If the product exists, add the new images to the existing product
      product.extra_image_name.push(...product_extra_image); // Add new images to the array
      await product.save(); // Save the updated product document
    }

    res.redirect(`/product_details?image=${product_name}`); // Redirect back to product details page
  } catch (error) {
    console.error(error);
    res.redirect('/upload_err');  // In case of error, redirect to error page
  }
};



const upload_err = async (req, res) => {

  res.render('upload_err')
}

// delete image on home page
const delete_image = async (req, res) => {
  const { imageName } = req.body;
  const slide1 = req.body.slide1;
  const slide2 = req.body.slide2;
  const slide3 = req.body.slide3;
  console.log(imageName, slide2);

  if (!imageName) {
    return res.status(400).json({ success: false, message: "Image name is required." });
  }

  try {
    if (slide1 == 1) {
      // Remove the image record from MongoDB
      const deletedImage = await top_slide_image_model.findOneAndDelete({ name: imageName });
      if (!deletedImage) {
        return res.status(404).json({ success: false, message: "Image not found in database." });
      }


      // Remove the image file from the project directory
      const imagePath = path.join(__dirname, '..', 'public', 'images', 'uploded_image', imageName);
      console.log(imagePath);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the file
      }

    }
    if (slide2 == 2) {
      // Delete the image from the slide2 model
      const deletedImage = await slide2_model.findOneAndDelete({ name: imageName });
      if (!deletedImage) {
        return res.status(404).json({ success: false, message: "Image not found in slide2 model." });
      }

      const imagePath = path.join('E:', 'shope website', 'public', 'images', 'uploded_image', imageName);

      // Delete the image file from the server
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
          return res.status(500).json({ error: "Failed to delete image from server." });
        } else {
          console.log("Image deleted successfully:", imageName);
        }
      });

      // Try to find the product with the corresponding image name in extra images
      const product_Id = await product_extra_image_model.findOne({ product_name: imageName });

      if (product_Id) {
        // If the product exists with the extra images, delete the entire product document
        const delete_all_extra_img = await product_extra_image_model.findOneAndDelete({
          product_name: imageName
        });
        if (!delete_all_extra_img) {
          return res.status(404).json({ success: false, message: "Product img not deleted in product_extra_image_model." });
        }

        console.log("All extra images and product deleted from database successfully.");

        if (product_Id && product_Id.extra_image_name?.forEach) {
          product_Id.extra_image_name.forEach(image => {
            const imagePath = path.join(__dirname, '..', 'public', 'images', 'uploded_image', image);
            if (fs.existsSync(imagePath)) {
              try {
                fs.unlinkSync(imagePath);
                console.log(`Deleted: ${imagePath}`);
              } catch (error) {
                console.error(`Error deleting ${imagePath}: ${error.message}`);
              }
            }
          });
        }


      } else {
        console.log("No extra images found for this product in database.");
      }
    }

    res.redirect('/home')
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
//  delete product in product range , product page
const product_delete_image = async (req, res) => {
  try {
    const category = req.body.categories;
    const imageName = req.body.imageName;
    console.log(category, imageName, 'aaaaaaa');

    if (!category || !imageName) {
      return res.status(400).json({ error: 'Product details are required.' });
    }

    // Fetch the product from the database
    const product = await product_model.findOne({ [category]: { $in: [imageName] } });
    console.log(product);
    if (!product) {
      return res.status(404).json({ error: "Product not found in database (In product range)." });
    }

    // Remove the image from the database
    const updatedDocument = await product_model.findOneAndUpdate(
      { [category]: { $in: [imageName] } }, // Ensure the image exists in the category
      { $pull: { [category]: imageName } }, // Remove the image from the array
      { new: true } // Return the updated document
    );

    if (!updatedDocument) {
      return res.status(404).json({ error: 'Image not found in the specified category.' });
    }

    // Delete the image file from the server
    const imagePath = path.join(__dirname, '..', 'public', 'images', 'uploded_image', imageName);

    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully from product range.");
      }
    } catch (err) {
      console.error('Error deleting image file:', err);
      return res.status(500).json({ error: 'Failed to delete the image file from project file.' });
    }

    // Fetch product extra image details
    const product_Id = await product_extra_image_model.findOne({ product_name: imageName });
    console.log(product_Id);

    if (product_Id) {
      // Delete product from extra image model
      const delete_all_extra_img = await product_extra_image_model.findOneAndDelete({
        product_name: imageName
      });

      if (!delete_all_extra_img) {
        return res.status(404).json({ success: false, message: "Product img not deleted in product_extra_image_model." });
      }

      console.log("All extra images and product deleted from database successfully.");

      // Delete all extra images from the server
      if (product_Id.extra_image_name?.forEach) {
        product_Id.extra_image_name.forEach(image => {
          const extraImagePath = path.join(__dirname, '..', 'public', 'images', 'uploded_image', image);
          if (fs.existsSync(extraImagePath)) {
            try {
              fs.unlinkSync(extraImagePath);
              console.log(`Deleted: ${extraImagePath}`);
            } catch (error) {
              console.error(`Error deleting ${extraImagePath}: ${error.message}`);
            }
          }
        });
      }
    } else {
      console.log("No extra images found for this product in database.");
    }

    res.redirect('/home');

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'An error occurred while deleting the image.' });
  }
};


// delete extra images  product detail page
const extra_product_delete_image = async (req, res) => {
  try {
    const { product_name, imageName } = req.body;

    console.log("Received:", { product_name, imageName });

    if (!product_name || !imageName) {
      return res.status(400).json({ error: "Product name and image name are required." });
    }

    // Find the document by product_name and check if image exists in array
    const product = await product_extra_image_model.findOne({ product_name });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // if (!product.extra_image_name.includes(imageName)) {
    //   return res.status(404).json({ error: "Image not found in product's extra images." });
    // }

    // Remove the image from the extra_image_name array
    const updatedDocument = await product_extra_image_model.findOneAndUpdate(
      { product_name },
      { $pull: { extra_image_name: imageName } }, // Remove image from array
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(500).json({ error: "Failed to update product extra images." });
    }

    // Define the correct image path
    const imagePath = path.join('E:', 'shope website', 'public', 'images', 'uploded_image', imageName);

    // Delete the image file from the server
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image file:", err);
        return res.status(500).json({ error: "Failed to delete image from server." });
      }

      console.log("Image deleted successfully:", imageName);
      //   return res.status(200).json({ message: "Image deleted successfully.", updatedDocument });

    });
    // res.redirect('/product_details?image=<%=product_name %>')
    res.redirect('/home')

  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "An error occurred while deleting the image." });
  }
};


// page2
const page2 = async (req, res) => {

  const userRole = req.session.userRole || null;


  res.render('page2', { userRole })
}
module.exports = { home_page, product_details_page, about_page, product_page, sign_in_page, sign_in_page_post, top_slide_image, product, product_extra_image, logout, upload_err, delete_image, product_delete_image, extra_product_delete_image, page2 }

// page2_post 