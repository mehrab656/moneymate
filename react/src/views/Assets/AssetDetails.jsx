import React, { memo } from "react";
import { Col, Row, Table, Button } from "react-bootstrap";

const AssetDetails = ({ data }) => {
  const asset = data?.data || data;
  
  console.log('asset', asset)
  console.log('data', data)
  

  
  if (!asset) {
    return (
      <div className="d-flex justify-content-center align-items-center asset-details-loading">
        <div className="text-muted">No asset data available</div>
      </div>
    );
  }

  return (
    <div className="asset-details asset-details-container">

      <div className="mb-4">
        {/* Asset Summary - Responsive */}
        <div className="balance-section">
          <Row className="g-2 asset-details-row">
            <Col xs={12} md={4} className="asset-details-col">
              <div className="info-card">
                <div className="info-label">Sector</div>
                <div className="info-value">{asset?.sector_name || 'N/A'}</div>
              </div>
            </Col>
            <Col xs={12} md={4} className="asset-details-col">
              <div className="info-card">
                <div className="info-label">Purchase Date</div>
                <div className="info-value">{asset?.date || 'N/A'}</div>
              </div>
            </Col>
            <Col xs={12} md={4} className="asset-details-col">
              <div className="info-card">
                <div className="info-label">Status</div>
                <div className="info-value">
                  {asset?.status === 1 ? "Active" : "Paused"}
                </div>
              </div>
            </Col>
          </Row>
          
          {/* Balance Information */}
          <Row className="g-2 mt-2 asset-details-balance-row">
            <Col xs={12} className="asset-details-col">
              <h6 className="section-title mb-2">Balance Information</h6>
            </Col>
            <Col xs={12} md={4} className="asset-details-col">
              <div className="info-card">
                <div className="info-label">Total Asset Amount</div>
                <div className="info-value">{asset?.total_price || '0'}</div>
              </div>
            </Col>
            <Col xs={12} md={4} className="asset-details-col">
              <div className="info-card">
                <div className="info-label">Damaged Asset's Amount</div>
                <div className="info-value">{asset?.total_damaged || '0'}</div>
              </div>
            </Col>
            <Col xs={12} md={4} className="asset-details-col">
              <div className="info-card">
                <div className="info-label">Asset Used Amount</div>
                <div className="info-value">{asset?.total_used || '0'}</div>
              </div>
            </Col>
          </Row>
        </div>
        
        {/* Asset Information Table - Responsive */}
        <div className="mb-3">
          <h6 className="section-title text-center">Asset Information</h6>
          
          {/* Desktop Table */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <Table bordered className="asset-view-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                    <th>Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    try {
                      const assetsArray = asset?.assets 
                        ? (typeof asset.assets === 'string' ? JSON.parse(asset.assets) : asset.assets)
                        : [];
                      return Array.isArray(assetsArray) ? assetsArray.map((_asset, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{_asset?.name || 'N/A'}</td>
                          <td>{_asset?.description || 'N/A'}</td>
                          <td>{_asset?.qty || '0'}</td>
                          <td>{_asset?.unit_price || '0'}</td>
                          <td>{_asset?.total_price || '0'}</td>
                          <td>{_asset?.current_stock || _asset?.qty || '0'}</td>
                        </tr>
                      )) : [];
                    } catch (error) {
                      console.error('Error parsing assets data:', error);
                      return [];
                    }
                  })()}
                </tbody>
              </Table>
            </div>
          </div>
          
          {/* Mobile Cards */}
          <div className="d-md-none">
            {(() => {
              try {
                const assetsArray = asset?.assets 
                  ? (typeof asset.assets === 'string' ? JSON.parse(asset.assets) : asset.assets)
                  : [];
                return Array.isArray(assetsArray) ? assetsArray.map((_asset, index) => (
                  <div key={index} className="asset-info-card">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Asset #{index + 1}</h6>
                    </div>
                    <Row className="g-2">
                      <Col xs={12}>
                        <div className="info-label">Name</div>
                        <div className="info-value">{_asset?.name || 'N/A'}</div>
                      </Col>
                      <Col xs={12}>
                        <div className="info-label">Description</div>
                        <div className="info-value">{_asset?.description || 'N/A'}</div>
                      </Col>
                      <Col xs={6}>
                        <div className="info-label">Quantity</div>
                        <div className="info-value">{_asset?.qty || '0'}</div>
                      </Col>
                      <Col xs={6}>
                        <div className="info-label">Unit Price</div>
                        <div className="info-value">{_asset?.unit_price || '0'}</div>
                      </Col>
                      <Col xs={6}>
                        <div className="info-label">Total Price</div>
                        <div className="info-value">{_asset?.total_price || '0'}</div>
                      </Col>
                      <Col xs={6}>
                        <div className="info-label">Current Stock</div>
                        <div className="info-value">{_asset?.current_stock || _asset?.qty || '0'}</div>
                      </Col>
                    </Row>
                  </div>
                )) : [];
              } catch (error) {
                console.error('Error parsing assets data:', error);
                return [];
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AssetDetails);