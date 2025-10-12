# Local Download Toggle Feature

**Last Updated**: 2025-10-12

## Overview

A development toggle feature that allows users to download recorded video clips directly to their local browser's downloads folder. This is independent of the Livepeer upload flow and provides instant local backup of created content.

## Location

- **File**: `src/pages/Capture.tsx`
- **UI Position**: Controls panel, below the Quality slider
- **State Variable**: `downloadToLocalEnabled` (line ~179)
- **Download Function**: `downloadBlobToLocal()` (lines ~734-759)
- **Integration Point**: `stopRecording()` function (lines ~806-813)

## How It Works

### User Flow

1. User sees toggle switch in the Capture page controls panel labeled "Download to Browser"
2. Toggle is **ON by default** (green when enabled)
3. When user records a clip (3-10 seconds):
   - Video is recorded via `VideoRecorder` class
   - If toggle is ON: File downloads to browser's downloads folder immediately
   - Toast notification appears: "File downloaded - Video saved to your downloads folder"
   - Then proceeds with normal Livepeer upload and database save

### Technical Implementation

```typescript
// State management
const [downloadToLocalEnabled, setDownloadToLocalEnabled] = useState(true);

// Download function
const downloadBlobToLocal = (blob: Blob, timestamp: number) => {
  // Creates filename: brewdream-clip-YYYY-MM-DDTHH-MM-SS.webm
  const date = new Date(timestamp);
  const dateStr = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `brewdream-clip-${dateStr}.webm`;

  // Programmatic download via temporary <a> element
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

// Integration in stopRecording()
if (downloadToLocalEnabled) {
  downloadBlobToLocal(blob, timestamp);
  toast({
    title: 'File downloaded',
    description: 'Video saved to your downloads folder',
  });
}
```

## File Naming Convention

**Format**: `brewdream-clip-YYYY-MM-DDTHH-MM-SS.webm`

**Examples**:
- `brewdream-clip-2025-10-12T15-30-45.webm`
- `brewdream-clip-2025-10-12T09-15-22.webm`

**Why This Format**:
- **Sortable**: ISO 8601 timestamp prefix ensures chronological sorting
- **Readable**: Clear date and time components
- **Safe**: No special characters that might cause filesystem issues
- **Descriptive**: "brewdream-clip" prefix makes purpose immediately clear
- **Extension**: `.webm` indicates video format (matches recording MIME type)

## UI Components Used

- **Switch**: `@/components/ui/switch` (shadcn/ui component)
- **Download Icon**: `lucide-react` icon library
- **Toast**: `@/hooks/use-toast` for user feedback

## Design Decisions

### Why Start Enabled?

The toggle starts ON by default because:
1. **Developer convenience**: Primary use case is local testing/debugging
2. **Non-intrusive**: Doesn't interfere with production upload flow
3. **Safety**: Provides automatic local backup of content
4. **User control**: Can be easily disabled if not needed

### Why Download Before Upload?

The download happens before Livepeer upload because:
1. **Instant feedback**: User gets immediate confirmation
2. **Reliability**: Local save succeeds even if upload fails
3. **Performance**: Doesn't block the upload process
4. **UX**: User sees file saving while upload processes in background

### Why Not Use `downloadUrl` from Livepeer?

We download the local blob instead of using Livepeer's `downloadUrl` because:
1. **Timing**: Available immediately, no waiting for upload/processing
2. **Accuracy**: Exact recorded content, byte-for-byte
3. **Independence**: Works even if Livepeer upload fails
4. **Simplicity**: No additional API calls needed

## Common Search Terms

Keywords for finding this feature later:
- local download
- browser download
- save to downloads folder
- development toggle
- download clip locally
- save video file
- local file save
- download webm
- automatic download
- browser file download

## Troubleshooting

### Downloads Not Working

**Possible Causes**:
1. Browser blocking automatic downloads
   - **Solution**: Check browser settings, allow downloads from site
2. Blob creation failed
   - **Solution**: Check console for errors, verify recording completed
3. Filesystem permission issues
   - **Solution**: Check browser downloads settings, ensure write access

### Files Have Wrong Name

**If timestamp is wrong**:
- Check system clock settings
- Verify timezone is correct

**If format is unexpected**:
- Check `downloadBlobToLocal()` function hasn't been modified
- Verify `Date.toISOString()` is working correctly

### Toggle State Not Persisting

**Note**: Toggle state is NOT persisted across page reloads by design. It always starts ON.

**To add persistence** (if needed):
```typescript
// In component initialization
const [downloadToLocalEnabled, setDownloadToLocalEnabled] = useState(() => {
  const saved = localStorage.getItem('brewdream_download_enabled');
  return saved === null ? true : saved === 'true';
});

// When toggle changes
useEffect(() => {
  localStorage.setItem('brewdream_download_enabled', String(downloadToLocalEnabled));
}, [downloadToLocalEnabled]);
```

## Testing

### Manual Testing

1. Navigate to `/capture`
2. Start camera (front or back)
3. Record a clip (3-10 seconds)
4. Verify file downloads to browser's downloads folder
5. Check filename matches format: `brewdream-clip-YYYY-MM-DDTHH-MM-SS.webm`
6. Verify video plays correctly
7. Toggle OFF and record again
8. Verify no download occurs
9. Check clip still uploads to Livepeer and saves to database

### Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS/iOS)

**Note**: Uses standard Web APIs (`URL.createObjectURL`, `Blob`, `<a download>`), which have broad support.

## Related Files

- `src/lib/recording.ts` - VideoRecorder class, upload logic
- `src/pages/Capture.tsx` - Main capture UI and recording flow
- `docs/RECORDING_IMPLEMENTATION.md` - Full recording flow documentation

## Future Enhancements

Potential improvements (not currently implemented):

1. **Persistent State**: Save toggle state to localStorage
2. **Download Format Options**: Allow choosing MP4/WebM
3. **Filename Customization**: Let users set custom prefix
4. **Download Queue**: Show progress for multiple downloads
5. **Auto-organize**: Create folders by date automatically
6. **Cloud Sync**: Optional sync to Dropbox/Google Drive

## Related Documentation

- [Recording Implementation](./RECORDING_IMPLEMENTATION.md) - Core recording flow
- [Documentation Guidelines](./DOCUMENTATION_GUIDELINES.md) - How to document features

---

**Maintainer Notes**:
- Keep this doc updated if UI changes location
- Update if filename format changes
- Add new troubleshooting items as issues arise
- Document any browser-specific quirks discovered
