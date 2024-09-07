import FormLabel from "@mui/material/FormLabel";
import {FormControl, FormGroup} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import React, {memo} from "react";


const RoleLists = ({handelCheck}) => {
    const companyPermissions = ['create', 'view', 'edit', 'delete'];

    const modules = {
        company: ['create', 'view', 'edit', 'delete'],
        sector: ['create', 'view', 'edit', 'delete'],
        category: ['create', 'view', 'edit', 'delete'],
        investment: ['create', 'view', 'edit', 'delete'],
        expense: ['create', 'view', 'edit', 'delete'],
        income: ['create', 'view', 'edit', 'delete'],
        return: ['create', 'view', 'edit', 'delete'],
        income_report: ['create', 'view', 'edit', 'delete'],
        expense_report: ['create', 'view', 'edit', 'delete'],
        investment_report: ['create', 'view', 'edit', 'delete'],
        monthly_report: ['create', 'view', 'edit', 'delete'],
        overall_report: ['create', 'view', 'edit', 'delete'],
        bank: ['create', 'view', 'edit', 'delete'],
        account: ['create', 'view', 'edit', 'delete','transfer'],
        balance: ['create', 'view', 'edit', 'delete'],
        debt: ['create', 'view', 'edit', 'delete'],
        loans: ['create', 'view', 'edit', 'delete'],
        budget: ['create', 'view', 'edit', 'delete'],
        investment_plan: ['create', 'view', 'edit', 'delete'],
        calender: ['create', 'view', 'edit', 'delete'],
        activity_log: ['create', 'view', 'edit', 'delete'],
        settings: ['create', 'view', 'edit', 'delete'],
        user: ['create', 'view', 'edit', 'delete'],
        profile: ['create', 'view', 'edit', 'delete'],
        role: ['create', 'view', 'edit', 'delete'],
        dashboard: ['monthly_income', 'monthly_expense', 'account_balance', 'lend_amount','borrow_amount','total_bank','expense_chart','exp_budget','active_budget']
    };
    const moduleArray =Object.entries(modules);


    return (
        <div className="form-group">
            {
                moduleArray.map((module,name)=>{
                    const moduleName = module[0];
                    const moduleArray = module[1];
                    return (
                        <>
                            <FormControl component="fieldset">
                                <FormLabel>
                                    {moduleName.replace('_',' ').toUpperCase()}
                                </FormLabel>
                                <FormGroup aria-label="position" row>
                                    {
                                        moduleArray.map(permission => {
                                            return (
                                                <FormControlLabel key={moduleName+"_" + permission}
                                                                  value={moduleName+"_" + permission}
                                                                  control={<Checkbox color="primary" checked/>}
                                                                  label={permission.replace('_',' ').toUpperCase()}
                                                                  labelPlacement="end"
                                                                  onChange={(e) => handelCheck(e, permission)}
                                                />
                                            )
                                        })
                                    }
                                </FormGroup>
                            </FormControl>
                            <br/>
                        </>
                    )
                })
            }



        </div>
    )
}

export default memo(RoleLists);{/* Company Permissions */}
{/* <Box display={'flex'}>
  <h3>Company</h3>
  <FormControlLabel
      sx={{ml:2}}
      control={<Checkbox checked={Object.values(permissions.company).every(Boolean)} onChange={(e) => handleSelectAll(e, 'company')} name="selectAll" />}
      label="Select All"
  />
</Box>
<FormControlLabel
  control={<Checkbox checked={permissions.company.company_create} onChange={(e) => handleChange(e, 'company')} name="company_create" />}
  label="Create"
/>
<FormControlLabel
  control={<Checkbox checked={permissions.company.company_view} onChange={(e) => handleChange(e, 'company')} name="company_view" />}
  label="View"
/>
<FormControlLabel
  control={<Checkbox checked={permissions.company.company_edit} onChange={(e) => handleChange(e, 'company')} name="company_edit" />}
  label="Edit"
/>
<FormControlLabel
  control={<Checkbox checked={permissions.company.company_delete} onChange={(e) => handleChange(e, 'company')} name="company_delete" />}
  label="Delete"
/> */}
{/* <hr/> */}
{/* Sector Permissions */}
{/* <Box display={'flex'}>
  <h3>Sector</h3>
  <FormControlLabel
      sx={{ml:2}}
      control={<Checkbox checked={Object.values(permissions.sector).every(Boolean)} onChange={(e) => handleSelectAll(e, 'sector')} name="selectAll" />}
      label="Select All"
  />
</Box>
<FormControlLabel
  control={<Checkbox checked={permissions.sector.sector_create} onChange={(e) => handleChange(e, 'sector')} name="sector_create" />}
  label="Create"
/>
<FormControlLabel
  control={<Checkbox checked={permissions.sector.sector_view} onChange={(e) => handleChange(e, 'sector')} name="sector_view" />}
  label="View"
/>
<FormControlLabel
  control={<Checkbox checked={permissions.sector.sector_edit} onChange={(e) => handleChange(e, 'sector')} name="sector_edit" />}
  label="Edit"
/>
<FormControlLabel
  control={<Checkbox checked={permissions.sector.sector_delete} onChange={(e) => handleChange(e, 'sector')} name="sector_delete" />}
  label="Delete"
/> */}

{/* Add other sections similarly */}