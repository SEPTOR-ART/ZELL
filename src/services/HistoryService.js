import * as SQLite from 'expo-sqlite';

/**
 * History Service for ZELL
 * Handles local storage of conversion and compression history
 */
class HistoryService {
  static db = null;

  /**
   * Initialize database
   */
  static async initDatabase() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('zell_history.db');
      
      // Create history table if it doesn't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          operation TEXT NOT NULL,
          originalName TEXT NOT NULL,
          originalSize INTEGER NOT NULL,
          newSize INTEGER NOT NULL,
          compressionRatio REAL NOT NULL,
          targetFormat TEXT,
          compressionLevel TEXT,
          downloadUrl TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
  }

  /**
   * Add history item
   * @param {Object} item - History item data
   * @returns {Promise<number>} Item ID
   */
  static async addHistoryItem(item) {
    await this.initDatabase();

    const result = await this.db.runAsync(
      `INSERT INTO history (
        operation, originalName, originalSize, newSize, compressionRatio,
        targetFormat, compressionLevel, downloadUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.operation,
        item.originalName,
        item.originalSize,
        item.newSize,
        item.compressionRatio,
        item.targetFormat || null,
        item.compressionLevel || null,
        item.downloadUrl || null,
      ]
    );

    return result.lastInsertRowId;
  }

  /**
   * Get all history items
   * @param {Object} options - Query options
   * @returns {Promise<Array>} History items
   */
  static async getHistory(options = {}) {
    await this.initDatabase();

    const {
      limit = 100,
      offset = 0,
      operation = null,
      sortBy = 'timestamp',
      sortOrder = 'DESC',
    } = options;

    let query = 'SELECT * FROM history';
    const params = [];

    // Add operation filter
    if (operation) {
      query += ' WHERE operation = ?';
      params.push(operation);
    }

    // Add sorting
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await this.db.getAllAsync(query, params);
    return result;
  }

  /**
   * Get history item by ID
   * @param {number} id - Item ID
   * @returns {Promise<Object|null>} History item
   */
  static async getHistoryItem(id) {
    await this.initDatabase();

    const result = await this.db.getFirstAsync(
      'SELECT * FROM history WHERE id = ?',
      [id]
    );

    return result || null;
  }

  /**
   * Update history item
   * @param {number} id - Item ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<boolean>} Success status
   */
  static async updateHistoryItem(id, updates) {
    await this.initDatabase();

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE history SET ${setClause} WHERE id = ?`;
    
    const result = await this.db.runAsync(query, [...values, id]);
    return result.changes > 0;
  }

  /**
   * Delete history item
   * @param {number} id - Item ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteHistoryItem(id) {
    await this.initDatabase();

    const result = await this.db.runAsync(
      'DELETE FROM history WHERE id = ?',
      [id]
    );

    return result.changes > 0;
  }

  /**
   * Clear all history
   * @returns {Promise<boolean>} Success status
   */
  static async clearHistory() {
    await this.initDatabase();

    const result = await this.db.runAsync('DELETE FROM history');
    return result.changes >= 0;
  }

  /**
   * Get history statistics
   * @returns {Promise<Object>} Statistics
   */
  static async getHistoryStats() {
    await this.initDatabase();

    const stats = await this.db.getFirstAsync(`
      SELECT 
        COUNT(*) as totalItems,
        COUNT(CASE WHEN operation = 'convert' THEN 1 END) as conversions,
        COUNT(CASE WHEN operation = 'compress' THEN 1 END) as compressions,
        SUM(originalSize) as totalOriginalSize,
        SUM(newSize) as totalNewSize,
        AVG(compressionRatio) as averageCompressionRatio
      FROM history
    `);

    return {
      totalItems: stats.totalItems || 0,
      conversions: stats.conversions || 0,
      compressions: stats.compressions || 0,
      totalOriginalSize: stats.totalOriginalSize || 0,
      totalNewSize: stats.totalNewSize || 0,
      averageCompressionRatio: stats.averageCompressionRatio || 0,
      totalSpaceSaved: (stats.totalOriginalSize || 0) - (stats.totalNewSize || 0),
    };
  }

  /**
   * Search history items
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  static async searchHistory(query, options = {}) {
    await this.initDatabase();

    const {
      limit = 50,
      offset = 0,
      operation = null,
    } = options;

    let sqlQuery = `
      SELECT * FROM history 
      WHERE (originalName LIKE ? OR targetFormat LIKE ? OR operation LIKE ?)
    `;
    const params = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (operation) {
      sqlQuery += ' AND operation = ?';
      params.push(operation);
    }

    sqlQuery += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await this.db.getAllAsync(sqlQuery, params);
    return result;
  }

  /**
   * Get recent history items
   * @param {number} limit - Number of recent items
   * @returns {Promise<Array>} Recent history items
   */
  static async getRecentHistory(limit = 10) {
    return await this.getHistory({ limit, sortBy: 'timestamp', sortOrder: 'DESC' });
  }

  /**
   * Get history by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} History items in date range
   */
  static async getHistoryByDateRange(startDate, endDate) {
    await this.initDatabase();

    const result = await this.db.getAllAsync(
      'SELECT * FROM history WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [startDate.toISOString(), endDate.toISOString()]
    );

    return result;
  }

  /**
   * Export history to JSON
   * @param {Object} options - Export options
   * @returns {Promise<string>} JSON string
   */
  static async exportHistory(options = {}) {
    const {
      format = 'json',
      includeStats = true,
      dateRange = null,
    } = options;

    let historyItems;
    
    if (dateRange) {
      historyItems = await this.getHistoryByDateRange(dateRange.start, dateRange.end);
    } else {
      historyItems = await this.getHistory({ limit: 1000 });
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: historyItems.length,
      items: historyItems,
    };

    if (includeStats) {
      exportData.statistics = await this.getHistoryStats();
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import history from JSON
   * @param {string} jsonData - JSON data
   * @returns {Promise<number>} Number of imported items
   */
  static async importHistory(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      let importedCount = 0;

      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          try {
            await this.addHistoryItem(item);
            importedCount++;
          } catch (error) {
            console.error('Failed to import history item:', error);
          }
        }
      }

      return importedCount;
    } catch (error) {
      throw new Error('Invalid JSON data for import');
    }
  }

  /**
   * Clean up old history items
   * @param {number} daysToKeep - Number of days to keep
   * @returns {Promise<number>} Number of deleted items
   */
  static async cleanupOldHistory(daysToKeep = 30) {
    await this.initDatabase();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.db.runAsync(
      'DELETE FROM history WHERE timestamp < ?',
      [cutoffDate.toISOString()]
    );

    return result.changes;
  }

  /**
   * Get file type usage statistics
   * @returns {Promise<Object>} File type statistics
   */
  static async getFileTypeStats() {
    await this.initDatabase();

    const result = await this.db.getAllAsync(`
      SELECT 
        SUBSTR(originalName, INSTR(originalName, '.') + 1) as fileType,
        COUNT(*) as count,
        AVG(compressionRatio) as avgCompression
      FROM history 
      WHERE originalName LIKE '%.%'
      GROUP BY fileType
      ORDER BY count DESC
    `);

    return result;
  }
}

export default HistoryService;


