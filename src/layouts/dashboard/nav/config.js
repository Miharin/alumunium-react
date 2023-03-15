// Import Material
import {
  EqualizerRounded,
  ExpandLess,
  ExpandMore,
  PeopleRounded,
  FormatListBulletedRounded,
  DashboardRounded,
  ListRounded,
  PostAddRounded,
  EventNoteRounded,
  ReceiptRounded,
} from '@mui/icons-material';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
// Import Router
import { NavLink as RouterLink } from 'react-router-dom';
// Import Helpers
import { useSidebarConfig, useAuth } from 'store/index';

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
  const userCred = useAuth((state) => state.userCredentials);
  let itemNav = [];
  if (userCred.email.toLowerCase() === 'admin@alujaya.com' || userCred.email.toLowerCase() === 'bambang@gmail.com') {
    itemNav = [
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
            name: 'List And Manage Users',
            selected: 2,
            icon: <FormatListBulletedRounded />,
            links: '/dashboard/user',
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
            name: 'List Code Barang',
            selected: 3,
            icon: <ListRounded />,
            links: '/dashboard/products/code',
          },
          {
            id: 'P2',
            name: 'List Barang',
            selected: 4,
            icon: <FormatListBulletedRounded />,
            links: '/dashboard/products',
          },
          {
            id: 'P3',
            name: 'Tambah Barang',
            selected: 5,
            icon: <PostAddRounded />,
            links: '/dashboard/products/add',
          },
          {
            id: 'P4',
            name: 'Histori Barang',
            selected: 6,
            icon: <EventNoteRounded />,
            links: '/dashboard/products/history',
          },
          {
            id: 'P5',
            name: 'Transaksi Barang',
            selected: 7,
            icon: <ReceiptRounded />,
            links: '/dashboard/products/transaction',
          },
        ],
      },
    ];
  } else {
    itemNav = [
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
        name: 'Products',
        icon: <DashboardRounded />,
        isExpand: true,
        open: openProducts,
        toggle: toggleProducts,
        Expand: [
          {
            id: 'P1',
            name: 'List Code Barang',
            selected: 3,
            icon: <ListRounded />,
            links: '/dashboard/products/code',
          },
          {
            id: 'P2',
            name: 'List Barang',
            selected: 4,
            icon: <FormatListBulletedRounded />,
            links: '/dashboard/products',
          },
          {
            id: 'P3',
            name: 'Tambah Barang',
            selected: 5,
            icon: <PostAddRounded />,
            links: '/dashboard/products/add',
          },
          {
            id: 'P4',
            name: 'Histori Barang',
            selected: 6,
            icon: <EventNoteRounded />,
            links: '/dashboard/products/history',
          },
        ],
      },
    ];
  }

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
