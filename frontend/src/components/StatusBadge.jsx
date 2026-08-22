// StatusBadge.jsx - A small reusable component to display status indicators with correct coloring.
const StatusBadge = ({ status }) => {
  // Utility function to determine color scheme based on status value
  const getBadgeStyle = (statusStr) => {
    const normalizedStatus = (statusStr || '').toUpperCase();
    
    switch (normalizedStatus) {
      case 'APPROVED':
      case 'COMPLETED':
      case 'MATCH':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
      case 'FAILED':
      case 'NO_MATCH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'DOCUMENT_UPLOADED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'; // Default state
    }
  };

  const getDisplayText = (statusStr) => {
    if (!statusStr) return 'UNKNOWN';
    // Replace underscores with spaces and capitalize first letter
    return statusStr.replace(/_/g, ' ').charAt(0).toUpperCase() + statusStr.replace(/_/g, ' ').slice(1).toLowerCase();
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(status)}`}>
      {getDisplayText(status)}
    </span>
  );
};

export default StatusBadge;
