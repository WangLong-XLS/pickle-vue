/** 菜单项类型（对应后端 SysMenu 实体） */
export interface SysUser {
  userUuid?: string;
  userName?: string;
  userPassword?: string;
  userAge?: string;
  userSex?: string;
  userPhone?: string;
  roleUuidIn?: string | string[];
  orgUuidIn?: string | string[];
  orgCode?: string;
}

/** 动态菜单渲染用的树形结构 */
export interface MenuItem {
  menuUuid: string;
  menuName: string;
  menuPath?: string;
  menuIcon?: string;
  menuType: string;
  sysMenuIn?: MenuItem[];
}
