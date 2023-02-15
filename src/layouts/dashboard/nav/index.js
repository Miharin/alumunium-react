import PropTypes from 'prop-types';
// @mui
import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  Link,
  Drawer,
  Typography,
  Avatar,
  // Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
// mock
import account from '_mock/account';
// hooks
import useResponsive from 'hooks/useResponsive';
// components
import Logo from 'components/logo';
import Scrollbar from 'components/scrollbar';
import NavSection from 'components/nav-section';
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
import { useSidebarConfig } from 'store/index';
//
import navConfig from './config';
// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const isDesktop = useResponsive('up', 'lg');

  const openDashboard = useSidebarConfig((state) => state.openDashboard);
  const toggleDashboard = useSidebarConfig((state) => state.toggleDashboard);
  const openUsers = useSidebarConfig((state) => state.openUsers);
  const toggleUsers = useSidebarConfig((state) => state.toggleUsers);
  const openProducts = useSidebarConfig((state) => state.openProducts);
  const toggleProducts = useSidebarConfig((state) => state.toggleProducts);

  const itemNav = [
    {
      name: 'Dashboard',
      icon: <EqualizerRounded />,
      links: '/dashboard/app',
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
          icon: <FormatListBulletedRounded />,
          links: '/dashboard/user',
        },
        {
          id: 'U2',
          name: 'Manage Users',
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
          icon: <CropSquareRounded />,
          links: '',
        },
      ],
    },
  ];

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            <Avatar src={account.photoURL} alt="photoURL" />

            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {account.displayName}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {account.role}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      <NavSection data={navConfig} onClick={onCloseNav} />
      {itemNav.map((object, i) => (
        <List sx={{ pl: 1 }} key={i}>
          <ListItemButton onClick={object.isExpand ? object.toggle : null}>
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
                      <ListItemButton key={object.Expand[i].id} sx={{ pl: 3 }}>
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
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        // width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
