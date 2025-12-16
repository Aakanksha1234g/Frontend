const StatusList = (id, scriptInfoStatus, activeStatus) => [
  {
    name: 'Script Input',
    activeStatus: true,
    redirectedPath: `/cine-scribe/script-writing/${id}/input`,
  },
  {
    name: 'Script Details',
    activeStatus: scriptInfoStatus,
    redirectedPath: `/cine-scribe/script-writing/${id}/script-details`,
  },
  {
    name: 'Act Analysis',
    activeStatus: activeStatus,
    redirectedPath: `/cine-scribe/script-writing/${id}/analysis`,
  },
  {
    name: 'Beat Sheet',
    activeStatus: activeStatus,
    redirectedPath: `/cine-scribe/script-writing/${id}/beat-sheet`,
  },
  {
    name: 'Character Arc',
    activeStatus: activeStatus,
    redirectedPath: `/cine-scribe/script-writing/${id}/character-arc`,
  },
  {
    name: 'Script Report',
    activeStatus: activeStatus,
    redirectedPath: `/cine-scribe/script-writing/${id}/report`,
  },
  {
    name: 'Scene-wise Analysis',
    activeStatus: activeStatus, // or false depending on your needs
    redirectedPath: `/cine-scribe/script-writing/${id}/evaluation`,
  },
];

export default StatusList;
