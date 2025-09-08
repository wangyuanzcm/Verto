# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the AGPL-3.0 License.
# Temporary fix for missing python-ldap dependency

class LDAP:
    def __init__(self, server, port, rules, admin_dn, password, base_dn):
        self.server = server
        self.port = port
        self.rules = rules
        self.admin_dn = admin_dn
        self.password = password
        self.base_dn = base_dn

    def valid_user(self, username, password):
        # LDAP functionality disabled due to missing python-ldap dependency
        return False, 'LDAP功能暂时不可用，请使用本地账户登录'
