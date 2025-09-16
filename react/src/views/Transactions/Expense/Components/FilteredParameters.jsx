
import Badge from 'react-bootstrap/Badge';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faArrowRightLong, faClose} from "@fortawesome/free-solid-svg-icons";
import React from "react";
export default function FilteredParameters({queries,setQuery}){
    const updateQuery = (parameter,name=null,slug=null)=>{
        if (parameter==='date'){
            setQuery({...queries,start_date:'',end_date:''})
        }
        if (parameter==='check_for'||parameter==='check_from'||parameter==='check_to'){
            setQuery({...queries, check_for: "",check_from: "",check_to:""})
        }
        if (parameter==='order'){
            setQuery({...queries,order:''})
        }
        if (parameter==='orderBy'){
            setQuery({...queries,orderBy:''})
        }
        if (parameter==='limit'){
            setQuery({...queries,limit:''})
        }
        if (parameter==='sector'){
            let sectorIDS = queries.sectorIDS;
            let sectorNames = queries.sectorNames;
            sectorIDS = sectorIDS.filter(sectorID=> sectorID !== slug);
            sectorNames = sectorNames.filter(sectorName=> sectorName !== name);
            setQuery({...queries, sectorIDS: sectorIDS,sectorNames: sectorNames})
        }
        if (parameter==='reference'){
            let references = queries.reference;
            references = references.filter(ref=> ref !== name);
            setQuery({...queries, reference: references})
        }
        if (parameter==='incomeType'){
            let incomeType = queries.income_type;
            incomeType = incomeType.filter(type=> type !== name);
            setQuery({...queries, income_type: incomeType})
        }
    };

    return (
        <>
                <div className={"col-2"}><span><b>Filtered Queries:</b> </span></div>
                <div className={"col-10"}>
                    {
                        queries.sectorNames &&
                    <>
                        { queries.sectorNames.map((name,index)=>{
                            return(<Badge bg="secondary ml-1" key={`badge-sector-${index}`}>{name}
                                <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>updateQuery('sector',name,queries.sectorIDS[index])}/>
                            </Badge>)
                        })}
                    </>
                    }
                    {
                        queries.reference &&
                        <>
                            { queries.reference.map((ref,index)=>{
                                return(<Badge bg="secondary ml-1" key={`badge-reference-${index}`}>{ref}
                                    <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>updateQuery('reference',ref,queries.reference[index])}/>
                                </Badge>)
                            })}
                        </>
                    }
                    {
                        queries.income_type &&
                        <>
                            { queries.income_type.map((type,index)=>{
                                return(<Badge bg="secondary ml-1" key={`badge-income-type-${index}`}>{type}
                                    <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>updateQuery('incomeType',type,queries.income_type[index])}/>
                                </Badge>)
                            })}
                        </>
                    }

                    {
                        queries.limit &&
                        <>
                            <Badge bg="secondary m-1">Limit-{queries.limit}
                                <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>updateQuery('limit')}/>
                            </Badge>
                        </>
                    }
                    {
                        queries.check_for &&
                        <>
                            <Badge bg="secondary m-1">Online Check Status-{queries.check_for}
                                <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>updateQuery('check_for')}/>
                            </Badge>
                        </>
                    }
                    {
                        queries.check_from &&
                        <>
                            <Badge bg="secondary m-1">{queries.check_for==='checkinout'?'Check in from':(queries.check_for==='checkin'?'Check in from':'Check out from')}-{queries.check_from}
                                <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>updateQuery('check_from')}/>
                            </Badge>
                        </>
                    }
                    {
                        queries.check_to &&
                        <>
                            <Badge bg="secondary m-1">{queries.check_for==='checkinout'?'Check out to':(queries.check_for==='checkin'?'Check in to':'Check out to')} to-{queries.check_to}
                                <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>updateQuery('check_to')}/>
                            </Badge>
                        </>
                    }
                    {
                        queries.order &&
                        <>
                            <Badge bg="secondary m-1">Order-{queries.order}
                                <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>{updateQuery('order')}}/>
                            </Badge>
                        </>
                    }
                    {
                        queries.orderBy &&
                        <>
                            <Badge bg="secondary m-1">Order By-{queries.orderBy}
                                <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>{updateQuery('orderBy')}}/>
                            </Badge>
                        </>
                    }
                    {
                        queries.start_date &&
                        <>
                            <Badge bg="secondary m-1"><span>Date-{queries.start_date}<FontAwesomeIcon icon={faArrowRightLong}/>{queries.end_date} </span>
                                <FontAwesomeIcon icon={faClose} className={"badge-cursor float-end ml-2"} onClick={()=>{updateQuery('date')}}/>
                            </Badge>
                        </>
                    }
                </div>
        </>
    )
}