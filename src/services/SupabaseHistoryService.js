import { supabase, isSupabaseEnabled } from '../config/supabase';
import HistoryService from './HistoryService';

class SupabaseHistoryService {
  static TABLE_NAME = 'file_operations_history';

  static async ensureTable() {
    if (!isSupabaseEnabled()) {
      return false;
    }

    return true;
  }

  static async addHistoryItem(item) {
    if (!isSupabaseEnabled()) {
      return HistoryService.addHistoryItem(item);
    }

    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([{
          operation: item.operation,
          original_name: item.originalName,
          original_size: item.originalSize,
          new_size: item.newSize,
          compression_ratio: item.compressionRatio,
          target_format: item.targetFormat,
          compression_level: item.compressionLevel,
          download_url: item.downloadUrl,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Supabase add history error:', error);
      return HistoryService.addHistoryItem(item);
    }
  }

  static async getHistory(options = {}) {
    if (!isSupabaseEnabled()) {
      return HistoryService.getHistory(options);
    }

    try {
      const {
        limit = 100,
        offset = 0,
        operation = null,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = options;

      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      if (operation) {
        query = query.eq('operation', operation);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        operation: item.operation,
        originalName: item.original_name,
        originalSize: item.original_size,
        newSize: item.new_size,
        compressionRatio: item.compression_ratio,
        targetFormat: item.target_format,
        compressionLevel: item.compression_level,
        downloadUrl: item.download_url,
        timestamp: item.created_at,
      }));
    } catch (error) {
      console.error('Supabase get history error:', error);
      return HistoryService.getHistory(options);
    }
  }

  static async deleteHistoryItem(id) {
    if (!isSupabaseEnabled()) {
      return HistoryService.deleteHistoryItem(id);
    }

    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase delete history error:', error);
      return HistoryService.deleteHistoryItem(id);
    }
  }

  static async clearHistory() {
    if (!isSupabaseEnabled()) {
      return HistoryService.clearHistory();
    }

    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .neq('id', 0);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase clear history error:', error);
      return HistoryService.clearHistory();
    }
  }

  static async getHistoryStats() {
    if (!isSupabaseEnabled()) {
      return HistoryService.getHistoryStats();
    }

    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('operation, original_size, new_size, compression_ratio');

      if (error) throw error;

      const stats = data.reduce((acc, item) => {
        acc.totalItems++;
        if (item.operation === 'convert') acc.conversions++;
        if (item.operation === 'compress') acc.compressions++;
        acc.totalOriginalSize += item.original_size || 0;
        acc.totalNewSize += item.new_size || 0;
        acc.totalCompressionRatio += item.compression_ratio || 0;
        return acc;
      }, {
        totalItems: 0,
        conversions: 0,
        compressions: 0,
        totalOriginalSize: 0,
        totalNewSize: 0,
        totalCompressionRatio: 0,
      });

      return {
        ...stats,
        averageCompressionRatio: stats.totalItems > 0
          ? stats.totalCompressionRatio / stats.totalItems
          : 0,
        totalSpaceSaved: stats.totalOriginalSize - stats.totalNewSize,
      };
    } catch (error) {
      console.error('Supabase get stats error:', error);
      return HistoryService.getHistoryStats();
    }
  }

  static async searchHistory(query, options = {}) {
    if (!isSupabaseEnabled()) {
      return HistoryService.searchHistory(query, options);
    }

    try {
      const { limit = 50, offset = 0, operation = null } = options;

      let supabaseQuery = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .or(`original_name.ilike.%${query}%,target_format.ilike.%${query}%,operation.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (operation) {
        supabaseQuery = supabaseQuery.eq('operation', operation);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        operation: item.operation,
        originalName: item.original_name,
        originalSize: item.original_size,
        newSize: item.new_size,
        compressionRatio: item.compression_ratio,
        targetFormat: item.target_format,
        compressionLevel: item.compression_level,
        downloadUrl: item.download_url,
        timestamp: item.created_at,
      }));
    } catch (error) {
      console.error('Supabase search history error:', error);
      return HistoryService.searchHistory(query, options);
    }
  }

  static async getRecentHistory(limit = 10) {
    return await this.getHistory({ limit, sortBy: 'created_at', sortOrder: 'desc' });
  }

  static async exportHistory(options = {}) {
    const historyItems = await this.getHistory({ limit: 1000 });
    const stats = await this.getHistoryStats();

    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: historyItems.length,
      items: historyItems,
      statistics: stats,
    };

    return JSON.stringify(exportData, null, 2);
  }
}

export default SupabaseHistoryService;
