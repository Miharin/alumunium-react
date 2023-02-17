// Import Material
import {
  EqualizerRounded,
  ExpandLess,
  ExpandMore,
  PeopleRounded,
  FormatListBulletedRounded,
  ManageAccountsRounded,
  DashboardRounded,
  CropSquareRounded,
} from '@mui/icons-material';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
// Import Router
import { NavLink as RouterLink } from 'react-router-dom';
// Import Helpers
import { useSidebarConfig } from 'store/index';

export const NavSection = (onCloseNav) => {
  // Start Initialization
  const openDashboard = useSidebarConfig((state) => state.openDashboard);
  const toggleDashboard = useSidebarConfig((state) => state.toggleDashboard);
  const openUsers = useSidebarConfig((state) => state.openUsers);
  const toggleUsers = useSidebarConfig((state) => state.toggleUsers);
  const openProducts = useSidebarConfig((state) => state.openProducts);
  const toggleProducts = useSidebarConfig((state) => state.toggleProducts);
  const selectedIndex = useSidebarConfig((state) => state.selected);
  const setSelectedIndex = useSidebarConfig((state) => state.setSelected);

  const itemNav = [
    {
      name: 'Dashboard',
      icon: <EqualizerRounded />,
      links: '/dashboard/app',
      selected: 0,
      isExpand: false,
      open: openDashboard,
      toggle: toggleDashboard,
    },
    {
      name: 'Users',
      icon: <PeopleRounded />,
      isExpand: true,
      open: openUsers,
      toggle: toggleUsers,
      Expand: [
        {
          id: 'U1',
          name: 'List Users',
          selected: 1,
          icon: <FormatListBulletedRounded />,
          links: '/dashboard/user',
        },
        {
          id: 'U2',
          name: 'Manage Users',
          selected: 2,
          icon: <ManageAccountsRounded />,
          links: '',
        },
      ],
    },
    {
      name: 'Products',
      icon: <DashboardRounded />,
      isExpand: true,
      open: openProducts,
      toggle: toggleProducts,
      Expand: [
        {
          id: 'P1',
          name: 'List Holo',
          selected: 3,
          icon: <CropSquareRounded />,
          links: '/dashboard/products',
        },
      ],
    },
  ];
  // End initialization

  const NavSectionItem = (
    <>
      {itemNav.map((object, i) => (
        <List sx={{ pl: 1 }} key={i}>
          <ListItemButton
            component={RouterLink}
            selected={selectedIndex === object.selected}
            onClick={
              object.isExpand
                ? object.toggle
                : () => {
                    setSelectedIndex(object.selected);
                    onCloseNav();
                  }
            }
            to={object.links}
          >
            <ListItemIcon sx={{ minWidth: '0px', mr: 2, color: '#737373' }}>{object.icon}</ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ fontSize: '0.9em', fontWeight: object.open ? 'medium' : 'small' }}
              primary={object.name}
            />
            {object.isExpand ? object.open ? <ExpandLess /> : <ExpandMore /> : <></>}
          </ListItemButton>
          {object.isExpand ? (
            <Collapse in={object.open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {(() => {
                  const ListItemChild = [];
                  for (let i = 0; i < object.Expand.length; i++) {
                    ListItemChild.push(
                      <ListItemButton
                        key={object.Expand[i].id}
                        sx={{ pl: 3 }}
                        component={RouterLink}
                        selected={selectedIndex === object.Expand[i].selected}
                        onClick={() => {
                          setSelectedIndex(object.Expand[i].selected);
                          onCloseNav();
                        }}
                        to={object.Expand[i].links}
                      >
                        <ListItemIcon sx={{ minWidth: '0px', mr: 2, color: '#737373' }}>
                          {object.Expand[i].icon}
                        </ListItemIcon>
                        <ListItemText primaryTypographyProps={{ fontSize: '0.9em' }} primary={object.Expand[i].name} />
                      </ListItemButton>
                    );
                  }
                  return ListItemChild;
                })()}
              </List>
            </Collapse>
          ) : null}
        </List>
      ))}
    </>
  );
  return NavSectionItem;
};
