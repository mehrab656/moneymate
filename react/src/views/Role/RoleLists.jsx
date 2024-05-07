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
                                                                  control={<Checkbox color="primary"/>}
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

export default memo(RoleLists);