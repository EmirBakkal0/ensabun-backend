const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { promisePool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Add your frontend URLs
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ensabun Backend API is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'ok',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ===== ENSABUN SPECIFIC ENDPOINTS =====

// Get all product types
app.get('/api/product-types', async (req, res) => {
  try {
    const [rows] = await promisePool.execute('SELECT * FROM productType ORDER BY productTypeID');
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product types',
      error: error.message
    });
  }
});

// Get single product type by ID
app.get('/api/product-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await promisePool.execute(
      'SELECT * FROM productType WHERE productTypeID = ?', 
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching product type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product type',
      error: error.message
    });
  }
});

// Create new product type
app.post('/api/product-types', async (req, res) => {
  try {
    const { productType } = req.body;

    if (!productType) {
      return res.status(400).json({
        success: false,
        message: 'productType is required'
      });
    }
    
    const [result] = await promisePool.execute(
      'INSERT INTO productType (productType) VALUES (?)',
      [productType]
    );
    
    res.status(201).json({
      success: true,
      message: 'Product type created successfully',
      data: { productType }
    });
  } catch (error) {
    console.error('Error creating product type:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product type',
      error: error.message
    });
  }
});

// Update product type
app.put('/api/product-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { productType } = req.body;
    
    if (!productType) {
      return res.status(400).json({
        success: false,
        message: 'productType is required'
      });
    }
    
    const [result] = await promisePool.execute(
      'UPDATE productType SET productType = ? WHERE productTypeID = ?',
      [productType, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product type updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error updating product type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product type',
      error: error.message
    });
  }
});

// Delete product type
app.delete('/api/product-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are products using this type
    const [products] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM product WHERE productTypeID = ?',
      [id]
    );
    
    if (products[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product type. There are products using this type.'
      });
    }
    
    const [result] = await promisePool.execute(
      'DELETE FROM productType WHERE productTypeID = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product type deleted successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error deleting product type:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product type',
      error: error.message
    });
  }
});

// Get all products with product type information
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await promisePool.execute(`
      SELECT 
        p.productID,
        p.productName,
        p.totalCost,
        p.salePrice,
        p.stockAmount,
        p.productTypeID,
        pt.productType
      FROM product p
      LEFT JOIN productType pt ON p.productTypeID = pt.productTypeID
      ORDER BY p.productID
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get single product by ID with product type information
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await promisePool.execute(`
      SELECT 
        p.productID,
        p.productName,
        p.totalCost,
        p.salePrice,
        p.stockAmount,
        p.productTypeID,
        pt.productType
      FROM product p
      LEFT JOIN productType pt ON p.productTypeID = pt.productTypeID
      WHERE p.productID = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Create new product
app.post('/api/products', async (req, res) => {
  try {
    const { productName, totalCost, salePrice, stockAmount, productTypeID } = req.body;
    
    if (!productName || !productTypeID) {
      return res.status(400).json({
        success: false,
        message: 'productName and productTypeID are required'
      });
    }
    
    // Verify product type exists
    const [typeCheck] = await promisePool.execute(
      'SELECT productTypeID FROM productType WHERE productTypeID = ?',
      [productTypeID]
    );
    
    if (typeCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid productTypeID'
      });
    }
    
    const [result] = await promisePool.execute(
      'INSERT INTO product (productName, totalCost, salePrice, stockAmount, productTypeID) VALUES (?, ?, ?, ?, ?)',
      [productName, totalCost || 0, salePrice || 0, stockAmount || 0, productTypeID]
    );
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      insertId: result.insertId
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, totalCost, salePrice, stockAmount, productTypeID } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (productName !== undefined) {
      updates.push('productName = ?');
      values.push(productName);
    }
    if (totalCost !== undefined) {
      updates.push('totalCost = ?');
      values.push(totalCost);
    }
    if (salePrice !== undefined) {
      updates.push('salePrice = ?');
      values.push(salePrice);
    }
    if (stockAmount !== undefined) {
      updates.push('stockAmount = ?');
      values.push(stockAmount);
    }
    if (productTypeID !== undefined) {  
      // Verify product type exists
      const [typeCheck] = await promisePool.execute(
        'SELECT productTypeID FROM productType WHERE productTypeID = ?',
        [productTypeID]
      );
      
      if (typeCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid productTypeID'
        });
      }
      
      updates.push('productTypeID = ?');
      values.push(productTypeID);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    values.push(id);
    
    const [result] = await promisePool.execute(
      `UPDATE product SET ${updates.join(', ')} WHERE productID = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

//update product's type
app.put('/api/products/:id/typeID', async (req, res) => {
  try {
    const { id } = req.params;
    const { productTypeID } = req.body;
    console.log(`Updating product ${id} with typeID ${productTypeID}`);
    
    // Verify product type exists
    const [typeCheck] = await promisePool.execute(
      'SELECT productTypeID FROM productType WHERE productTypeID = ?',
      [productTypeID]
    );

    if (typeCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid productTypeID'
      });
    }

    const [result] = await promisePool.execute(
      'UPDATE product SET productTypeID = ? WHERE productID = ?',
      [productTypeID, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product type updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error updating product type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product type',
      error: error.message
    });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await promisePool.execute(
      'DELETE FROM product WHERE productID = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Search products by name
app.get('/api/products/search/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const [rows] = await promisePool.execute(`
      SELECT 
        p.productID,
        p.productName,
        p.totalCost,
        p.salePrice,
        p.stockAmount,
        p.productTypeID,
        pt.productType
      FROM product p
      LEFT JOIN productType pt ON p.productTypeID = pt.productTypeID
      WHERE p.productName LIKE ?
      ORDER BY p.productName
    `, [`%${name}%`]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
});

// Get products by type
app.get('/api/products/by-type/:typeId', async (req, res) => {
  try {
    const { typeId } = req.params;
    const [rows] = await promisePool.execute(`
      SELECT 
        p.productID,
        p.productName,
        p.totalCost,
        p.salePrice,
        p.stockAmount,
        p.productTypeID,
        pt.productType
      FROM product p
      LEFT JOIN productType pt ON p.productTypeID = pt.productTypeID
      WHERE p.productTypeID = ?
      ORDER BY p.productName
    `, [typeId]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching products by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by type',
      error: error.message
    });
  }
});

// Get low stock products (you can adjust the threshold)
app.get('/api/products/low-stock/:threshold?', async (req, res) => {
  try {
    const threshold = req.params.threshold || 10; // Default threshold is 10
    const [rows] = await promisePool.execute(`
      SELECT 
        p.productID,
        p.productName,
        p.totalCost,
        p.salePrice,
        p.stockAmount,
        p.productTypeID,
        pt.productType
      FROM product p
      LEFT JOIN productType pt ON p.productTypeID = pt.productTypeID
      WHERE p.stockAmount <= ?
      ORDER BY p.stockAmount ASC, p.productName
    `, [threshold]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
      threshold: parseInt(threshold)
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message
    });
  }
});

// ===== GENERIC ENDPOINTS (keeping for flexibility) =====
// ===== GENERIC ENDPOINTS (keeping for flexibility) =====

// GET all records from any table
app.get('/api/generic/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const [rows] = await promisePool.execute(`SELECT * FROM ??`, [table]);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching data',
      error: error.message
    });
  }
});

// GET single record by ID from any table
app.get('/api/generic/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const [rows] = await promisePool.execute(`SELECT * FROM ?? WHERE id = ?`, [table, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching record',
      error: error.message
    });
  }
});

// Custom search endpoint for any table
app.get('/api/generic/:table/search/:field/:value', async (req, res) => {
  try {
    const { table, field, value } = req.params;
    const [rows] = await promisePool.execute(
      `SELECT * FROM ?? WHERE ?? LIKE ?`, 
      [table, field, `%${value}%`]
    );
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error searching records:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching records',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection first
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();