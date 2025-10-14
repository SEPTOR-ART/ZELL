import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
  Surface,
  FAB,
  Searchbar,
  Menu,
  IconButton,
} from 'react-native-paper';
import * as Sharing from 'expo-sharing';

// Import components
import ShareButton from '../components/ShareButton';

// Import services
import HistoryService from '../services/HistoryService';

const HistoryScreen = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);

  /**
   * Load history items
   */
  const loadHistory = useCallback(async () => {
    try {
      const items = await HistoryService.getHistory();
      setHistoryItems(items);
      applyFiltersAndSort(items, searchQuery, sortBy, filterBy);
    } catch (error) {
      Alert.alert('Error', 'Failed to load history: ' + error.message);
    }
  }, [searchQuery, sortBy, filterBy]);

  /**
   * Apply filters and sorting
   */
  const applyFiltersAndSort = useCallback((items, query, sort, filter) => {
    let filtered = [...items];

    // Apply search filter
    if (query) {
      filtered = filtered.filter(item =>
        item.originalName.toLowerCase().includes(query.toLowerCase()) ||
        item.targetFormat.toLowerCase().includes(query.toLowerCase()) ||
        item.operation.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.operation === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'date':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return b.originalSize - a.originalSize;
        case 'compression':
          return b.compressionRatio - a.compressionRatio;
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, []);

  /**
   * Handle refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  /**
   * Handle search
   */
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    applyFiltersAndSort(historyItems, query, sortBy, filterBy);
  }, [historyItems, sortBy, filterBy, applyFiltersAndSort]);

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setMenuVisible(false);
    applyFiltersAndSort(historyItems, searchQuery, newSort, filterBy);
  }, [historyItems, searchQuery, filterBy, applyFiltersAndSort]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((newFilter) => {
    setFilterBy(newFilter);
    applyFiltersAndSort(historyItems, searchQuery, sortBy, newFilter);
  }, [historyItems, searchQuery, sortBy, applyFiltersAndSort]);

  /**
   * Delete history item
   */
  const deleteHistoryItem = useCallback(async (id) => {
    try {
      await HistoryService.deleteHistoryItem(id);
      await loadHistory();
      Alert.alert('Success', 'History item deleted');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete history item: ' + error.message);
    }
  }, [loadHistory]);

  /**
   * Download file from history
   */
  const downloadFile = useCallback(async (item) => {
    try {
      if (item.downloadUrl) {
        await Sharing.shareAsync(item.downloadUrl);
      } else {
        Alert.alert('Error', 'Download URL not available');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download file: ' + error.message);
    }
  }, []);

  /**
   * Share a file from history
   */
  const shareFile = useCallback(async (item) => {
    try {
      const file = {
        uri: item.downloadUrl || item.outputPath,
        name: item.fileName || item.originalName,
        size: item.outputSize || item.originalSize,
        mimeType: item.outputFormat || item.targetFormat,
      };
      
      console.log('Sharing file from history:', file);
      // The actual sharing will be handled by ShareButton component
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share file');
    }
  }, []);

  /**
   * Clear all history
   */
  const clearAllHistory = useCallback(async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await HistoryService.clearHistory();
              setHistoryItems([]);
              setFilteredItems([]);
              Alert.alert('Success', 'History cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history: ' + error.message);
            }
          },
        },
      ]
    );
  }, []);

  /**
   * Export history
   */
  const exportHistory = useCallback(async () => {
    try {
      const exportData = await HistoryService.exportHistory();
      await Sharing.shareAsync(exportData);
    } catch (error) {
      Alert.alert('Error', 'Failed to export history: ' + error.message);
    }
  }, []);

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Format date
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  /**
   * Get operation color
   */
  const getOperationColor = (operation) => {
    switch (operation) {
      case 'convert':
        return '#2196F3';
      case 'compress':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  /**
   * Load history on component mount
   */
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search and Filters */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Search & Filter</Title>
            <Searchbar
              placeholder="Search history..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchbar}
            />
            
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by:</Text>
              <View style={styles.chipContainer}>
                {['all', 'convert', 'compress'].map((filter) => (
                  <Chip
                    key={filter}
                    selected={filterBy === filter}
                    onPress={() => handleFilterChange(filter)}
                    style={styles.chip}
                  >
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.sortContainer}>
              <Text style={styles.filterLabel}>Sort by:</Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    icon="sort"
                    style={styles.sortButton}
                  >
                    {sortBy === 'date' ? 'Date' : 
                     sortBy === 'name' ? 'Name' :
                     sortBy === 'size' ? 'Size' : 'Compression'}
                  </Button>
                }
              >
                <Menu.Item onPress={() => handleSortChange('date')} title="Date" />
                <Menu.Item onPress={() => handleSortChange('name')} title="Name" />
                <Menu.Item onPress={() => handleSortChange('size')} title="Size" />
                <Menu.Item onPress={() => handleSortChange('compression')} title="Compression" />
              </Menu>
            </View>
          </Card.Content>
        </Card>

        {/* History Items */}
        {filteredItems.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Title>No History Items</Title>
              <Paragraph>
                {historyItems.length === 0
                  ? 'Your conversion and compression history will appear here.'
                  : 'No items match your current search and filter criteria.'}
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} style={styles.historyCard}>
              <Card.Content>
                <View style={styles.historyHeader}>
                  <View style={styles.historyInfo}>
                    <Title numberOfLines={1}>{item.originalName}</Title>
                    <Text style={styles.historySubtitle}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </View>
                  <View style={styles.historyActions}>
                    <Chip
                      style={[styles.operationChip, { backgroundColor: getOperationColor(item.operation) }]}
                      textStyle={styles.operationChipText}
                    >
                      {item.operation.toUpperCase()}
                    </Chip>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => deleteHistoryItem(item.id)}
                    />
                  </View>
                </View>

                <Surface style={styles.historyDetails}>
                  <View style={styles.detailRow}>
                    <Text>Original Size:</Text>
                    <Text>{formatFileSize(item.originalSize)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text>New Size:</Text>
                    <Text>{formatFileSize(item.newSize)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text>Compression Ratio:</Text>
                    <Text>{item.compressionRatio.toFixed(1)}%</Text>
                  </View>
                  {item.targetFormat && (
                    <View style={styles.detailRow}>
                      <Text>Target Format:</Text>
                      <Chip style={styles.formatChip}>
                        {item.targetFormat.toUpperCase()}
                      </Chip>
                    </View>
                  )}
                </Surface>

                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => downloadFile(item)}
                    icon="download"
                    style={styles.actionButton}
                  >
                    Download
                  </Button>
                  <ShareButton
                    file={{
                      uri: item.downloadUrl || item.outputPath,
                      name: item.fileName || item.originalName,
                      size: item.outputSize || item.originalSize,
                      mimeType: item.outputFormat || item.targetFormat,
                    }}
                    mode="icon"
                    size="small"
                    style={styles.actionButton}
                    onShareSuccess={(file) => {
                      console.log('File shared successfully from history:', file);
                    }}
                    onShareError={(error) => {
                      console.error('Share error:', error);
                    }}
                  />
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="dots-vertical"
        onPress={() => {
          Alert.alert(
            'History Options',
            'Choose an action',
            [
              { text: 'Export History', onPress: exportHistory },
              { text: 'Clear All', onPress: clearAllHistory, style: 'destructive' },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  sortContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  sortButton: {
    alignSelf: 'flex-start',
  },
  historyCard: {
    marginBottom: 12,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyInfo: {
    flex: 1,
    marginRight: 8,
  },
  historySubtitle: {
    color: '#757575',
    fontSize: 12,
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operationChip: {
    marginRight: 8,
  },
  operationChipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyDetails: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  formatChip: {
    height: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HistoryScreen;
