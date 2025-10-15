import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  IconButton,
  Divider,
  Menu,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const RibbonToolbar = ({
  activeTab = 'home',
  onTabChange,
  onActionPress,
  actions = {},
}) => {
  const theme = useTheme();
  const [activeRibbon, setActiveRibbon] = useState(activeTab);
  const [menuVisible, setMenuVisible] = useState({});

  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'convert', label: 'Convert', icon: 'swap-horizontal' },
    { id: 'compress', label: 'Compress', icon: 'compress' },
    { id: 'edit', label: 'Edit', icon: 'create' },
    { id: 'view', label: 'View', icon: 'eye' },
    { id: 'tools', label: 'Tools', icon: 'construct' },
  ];

  const ribbonSections = {
    home: [
      {
        title: 'File',
        items: [
          { id: 'new', icon: 'document-outline', label: 'New', color: theme.colors.primary },
          { id: 'open', icon: 'folder-open-outline', label: 'Open', color: theme.colors.primary },
          { id: 'save', icon: 'save-outline', label: 'Save', color: theme.colors.tertiary },
          { id: 'share', icon: 'share-outline', label: 'Share', color: theme.colors.secondary },
        ],
      },
      {
        title: 'Quick Actions',
        items: [
          { id: 'convert', icon: 'swap-horizontal', label: 'Convert' },
          { id: 'compress', icon: 'compress', label: 'Compress' },
          { id: 'merge', icon: 'layers-outline', label: 'Merge' },
          { id: 'split', icon: 'cut-outline', label: 'Split' },
        ],
      },
      {
        title: 'History',
        items: [
          { id: 'history', icon: 'time-outline', label: 'History' },
          { id: 'recent', icon: 'list-outline', label: 'Recent' },
        ],
      },
    ],
    convert: [
      {
        title: 'Convert To',
        items: [
          { id: 'to-pdf', icon: 'document-text', label: 'PDF' },
          { id: 'to-image', icon: 'image', label: 'Image' },
          { id: 'to-doc', icon: 'document', label: 'Word' },
          { id: 'to-audio', icon: 'musical-notes', label: 'Audio' },
          { id: 'to-video', icon: 'videocam', label: 'Video' },
        ],
      },
      {
        title: 'Quality',
        items: [
          { id: 'high-quality', icon: 'star', label: 'High' },
          { id: 'medium-quality', icon: 'star-half', label: 'Medium' },
          { id: 'low-quality', icon: 'star-outline', label: 'Low' },
        ],
      },
    ],
    edit: [
      {
        title: 'Edit',
        items: [
          { id: 'crop', icon: 'crop', label: 'Crop' },
          { id: 'resize', icon: 'resize', label: 'Resize' },
          { id: 'rotate', icon: 'sync', label: 'Rotate' },
          { id: 'filters', icon: 'color-filter', label: 'Filters' },
        ],
      },
      {
        title: 'Annotate',
        items: [
          { id: 'text', icon: 'text', label: 'Text' },
          { id: 'draw', icon: 'brush', label: 'Draw' },
          { id: 'highlight', icon: 'color-fill', label: 'Highlight' },
          { id: 'shapes', icon: 'square-outline', label: 'Shapes' },
        ],
      },
    ],
  };

  const handleTabPress = (tabId) => {
    setActiveRibbon(tabId);
    onTabChange?.(tabId);
  };

  const handleActionPress = (actionId) => {
    onActionPress?.(actionId);
  };

  const renderRibbonSection = (section, sectionIndex) => (
    <View key={sectionIndex} style={styles.ribbonSection}>
      <View style={styles.sectionItems}>
        {section.items.map((item, itemIndex) => (
          <TouchableOpacity
            key={itemIndex}
            style={styles.ribbonItem}
            onPress={() => handleActionPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.ribbonIconContainer,
              item.color && { backgroundColor: item.color + '20' }
            ]}>
              <Ionicons
                name={item.icon}
                size={28}
                color={item.color || theme.colors.onSurface}
              />
            </View>
            <Text style={styles.ribbonItemLabel} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.outline }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeRibbon === tab.id && {
                  borderBottomColor: theme.colors.primary,
                  borderBottomWidth: 3,
                },
              ]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={
                  activeRibbon === tab.id
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeRibbon === tab.id
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.ribbonContainer}
        contentContainerStyle={styles.ribbonContent}
      >
        {(ribbonSections[activeRibbon] || []).map((section, index) => (
          <React.Fragment key={index}>
            {renderRibbonSection(section, index)}
            {index < ribbonSections[activeRibbon].length - 1 && (
              <Divider style={styles.sectionDivider} />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tabScrollContent: {
    paddingHorizontal: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  ribbonContainer: {
    maxHeight: 120,
  },
  ribbonContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ribbonSection: {
    marginHorizontal: 8,
  },
  sectionItems: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ribbonItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 70,
  },
  ribbonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  ribbonItemLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionDivider: {
    width: 1,
    height: '80%',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
});

export default RibbonToolbar;
