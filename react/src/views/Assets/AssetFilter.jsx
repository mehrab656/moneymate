import { Card, Stack, Row, Col, Form, Button } from "react-bootstrap";

export default function AssetFilter(props) {
  const { search, query, setQuery, resetFilterParameter,placeHolderTxt } = props;
  return (
    <>
     <Card className="p-3 asset-filter-card">
      <Stack gap={3}>
        {/* Form Inputs */}
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="search">
              <Form.Label className="custom-form-label asset-filter-label">
                Search
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={query?.searchTerm}
                onChange={(e) => setQuery({ ...query, searchTerm: e.target.value })}
                placeholder={placeHolderTxt}
                className="asset-filter-input"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="order">
              <Form.Label className="custom-form-label asset-filter-label">
                Order
              </Form.Label>
              <Form.Select
                size="sm"
                value={query.orderBy}
                onChange={(e) => setQuery({ ...query, orderBy: e.target.value })}
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group controlId="limit">
              <Form.Label className="custom-form-label asset-filter-label">
                Limit
              </Form.Label>
              <Form.Select
                size="sm"
                value={query.limit}
                onChange={(e) => setQuery({ ...query, limit: e.target.value })}
              >
                <option value="">Limit</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Filter and Reset Buttons */}
        <Row className="justify-content-end">
          <Col md={4} className="text-end">
            <Button variant="warning" size="sm" onClick={resetFilterParameter}>
              Reset
            </Button>
          </Col>
        </Row>
      </Stack>
    </Card>
    </>
  );
}
